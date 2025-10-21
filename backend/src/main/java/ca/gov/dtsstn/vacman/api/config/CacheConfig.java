package ca.gov.dtsstn.vacman.api.config;

import java.util.Map.Entry;
import java.util.function.Function;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.github.benmanes.caffeine.cache.Caffeine;

import ca.gov.dtsstn.vacman.api.config.properties.ApplicationProperties;

@Configuration
@EnableCaching
@ConditionalOnProperty(name = { "application.caching.enabled" })
public class CacheConfig {

	static final Logger log = LoggerFactory.getLogger(CacheConfig.class);

	@Autowired ApplicationProperties applicationProperties;

	@Bean CacheManager cacheManager() {
		log.info("Creating 'cacheManager' bean");

		final var cacheSpecs = applicationProperties.caching().cacheSpecs();

		final var caches = cacheSpecs.entrySet().stream()
			.map(toCaffeineCache()).toList();

		final var cacheManager = new SimpleCacheManager();
		cacheManager.setCaches(caches);

		return cacheManager;
	}

	Function<Entry<String, String>, CaffeineCache> toCaffeineCache() {
		return entry -> new CaffeineCache(entry.getKey(), Caffeine.from(entry.getValue()).build());
	}

}
