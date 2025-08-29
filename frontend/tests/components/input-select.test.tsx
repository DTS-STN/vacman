import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { InputSelect } from '~/components/input-select';

describe('InputSelect', () => {
  it('should render input select component', () => {
    const { container } = render(
      <InputSelect
        id="some-id"
        name="test"
        label="label test"
        defaultValue="first"
        options={[
          { children: 'first option', value: 'first' },
          { children: 'second option', value: 'second' },
        ]}
      />,
    );

    expect(container).toMatchSnapshot('expected html');
  });

  it('should render input select component with help message', () => {
    const { container } = render(
      <InputSelect
        id="some-id"
        name="test"
        label="label test"
        defaultValue="first"
        options={[
          { children: 'first option', value: 'first' },
          { children: 'second option', value: 'second' },
        ]}
        helpMessage="help message"
      />,
    );

    expect(container).toMatchSnapshot('expected html');
  });

  it('should render input select component with required', () => {
    const { container } = render(
      <InputSelect
        id="some-id"
        name="test"
        label="label test"
        defaultValue="first"
        options={[
          { children: 'first option', value: 'first' },
          { children: 'second option', value: 'second' },
        ]}
        required
      />,
    );

    expect(container).toMatchSnapshot('expected html');
  });

  it('should render input select component with error message', () => {
    const { container } = render(
      <InputSelect
        id="some-id"
        name="test"
        label="label test"
        defaultValue="first"
        options={[
          { children: 'first option', value: 'first' },
          { children: 'second option', value: 'second' },
        ]}
        errorMessage="error message"
      />,
    );

    expect(container).toMatchSnapshot('expected html');
  });

  it('should not render label or aria-labelledby when label is empty', () => {
    const { container } = render(
      <InputSelect
        id="empty-label-id"
        name="test"
        label=""
        aria-label="Test aria label"
        defaultValue="first"
        options={[
          { children: 'first option', value: 'first' },
          { children: 'second option', value: 'second' },
        ]}
      />,
    );

    // Should not render a label element
    expect(container.querySelector('label')).toBeNull();

    // Should not have aria-labelledby attribute
    const selectElement = container.querySelector('select');
    expect(selectElement).toBeDefined();
    expect(selectElement?.getAttribute('aria-labelledby')).toBeNull();

    // Should still have aria-label attribute
    expect(selectElement?.getAttribute('aria-label')).toBe('Test aria label');
  });
});
