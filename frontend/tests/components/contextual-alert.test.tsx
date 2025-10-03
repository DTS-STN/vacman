import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ContextualAlert } from '~/components/contextual-alert';

describe('ContextualAlert', () => {
  it('should match snapshot for info type', () => {
    const { container } = render(
      <ContextualAlert type="info">
        <p>Snapshot test message</p>
      </ContextualAlert>,
    );

    expect(container).toMatchSnapshot();
  });

  it('should match snapshot for success type', () => {
    const { container } = render(
      <ContextualAlert type="success">
        <p>Success snapshot message</p>
      </ContextualAlert>,
    );

    expect(container).toMatchSnapshot();
  });

  it('should match snapshot for error type', () => {
    const { container } = render(
      <ContextualAlert type="error">
        <p>Error snapshot message</p>
      </ContextualAlert>,
    );

    expect(container).toMatchSnapshot();
  });
});
