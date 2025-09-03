import { createClient, createSentinel } from 'redis';
import { describe, expect, it, vi } from 'vitest';

import { serverEnvironment } from '~/.server/environment';
import { getRedisClient } from '~/.server/redis';

vi.mock('redis', () => ({
  createClient: vi.fn(() => ({
    isOpen: false,
    connect: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
  })),
  createSentinel: vi.fn(() => ({
    isOpen: false,
    connect: vi.fn(() => Promise.resolve()),
    on: vi.fn().mockReturnThis(),
  })),
}));

vi.mock('~/.server/environment', () => ({
  serverEnvironment: {
    REDIS_CONNECTION_TYPE: undefined, // set in each test
    REDIS_HOST: 'localhost',
    REDIS_PORT: 6379,
    REDIS_PASSWORD: { value: () => 'password' },
    REDIS_USERNAME: 'user',
    REDIS_SENTINEL_MASTER_NAME: 'mymaster',
    REDIS_COMMAND_TIMEOUT_SECONDS: 10,
  },
}));

vi.mock('~/.server/utils/instance-registry', () => ({
  singleton: vi.fn((_, factory) => factory()),
}));

describe('getRedisClient', () => {
  it('should create a Redis client in standalone mode', async () => {
    vi.mocked(serverEnvironment).REDIS_CONNECTION_TYPE = 'standalone';

    const redisClient = await getRedisClient();

    expect(createClient).toHaveBeenCalledWith({
      url: 'redis://localhost:6379',
      username: 'user',
      password: 'password',
      commandOptions: {
        timeout: 10000,
      },
      socket: {
        reconnectStrategy: expect.any(Function),
      },
    });

    expect(redisClient.connect).toHaveBeenCalled();
    expect(redisClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(redisClient.on).toHaveBeenCalledWith('ready', expect.any(Function));
    expect(redisClient.on).toHaveBeenCalledWith('reconnecting', expect.any(Function));
    expect(redisClient.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('should create a Redis client in sentinel mode', async () => {
    vi.mocked(serverEnvironment).REDIS_CONNECTION_TYPE = 'sentinel';

    const redisClient = await getRedisClient();

    expect(createSentinel).toHaveBeenCalledWith({
      name: 'mymaster',
      sentinelRootNodes: [{ host: 'localhost', port: 6379 }],
      nodeClientOptions: {
        username: 'user',
        password: 'password',
        commandOptions: {
          timeout: 10000,
        },
        socket: {
          reconnectStrategy: expect.any(Function),
        },
      },
    });

    expect(redisClient.connect).toHaveBeenCalled();
    expect(redisClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(redisClient.on).toHaveBeenCalledWith('ready', expect.any(Function));
    expect(redisClient.on).toHaveBeenCalledWith('reconnecting', expect.any(Function));
    expect(redisClient.on).toHaveBeenCalledWith('error', expect.any(Function));
  });
});
