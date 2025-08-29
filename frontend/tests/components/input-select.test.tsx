import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { InputSelect } from '~/components/input-select';

describe('InputSelect - Snapshot Only', () => {
  const defaultOptions = [
    { children: 'First option', value: 'first' },
    { children: 'Second option', value: 'second' },
  ];

  // Helper to get common props
  const getCommonProps = (overrides = {}) => ({
    id: 'test-select',
    name: 'test',
    label: 'Test Label',
    defaultValue: 'first',
    options: defaultOptions,
    ...overrides,
  });

  it('should render the select component within a div by default', () => {
    const { container } = render(<InputSelect {...getCommonProps()} />);
    expect(container).toMatchSnapshot('default_div_render');
  });

  it('should render the select component within a fieldset with a legend when ariaDescribedbyId is provided', () => {
    const { container } = render(<InputSelect {...getCommonProps({ ariaDescribedbyId: 'external-desc' })} />);
    expect(container).toMatchSnapshot('fieldset_with_legend_render');
  });

  it('should render input select component with help message (div container)', () => {
    const { container } = render(<InputSelect {...getCommonProps({ helpMessage: 'This is a helpful message.' })} />);
    expect(container).toMatchSnapshot('div_with_help_message');
  });

  it('should render input select component with help message (fieldset container)', () => {
    const { container } = render(
      <InputSelect
        {...getCommonProps({
          ariaDescribedbyId: 'external-desc',
          helpMessage: 'This is a helpful message.',
        })}
      />,
    );
    expect(container).toMatchSnapshot('fieldset_with_help_message');
  });

  it('should render input select component as required (div container)', () => {
    const { container } = render(<InputSelect {...getCommonProps({ required: true })} />);
    expect(container).toMatchSnapshot('div_required');
  });

  it('should render input select component as required (fieldset container)', () => {
    const { container } = render(<InputSelect {...getCommonProps({ required: true, ariaDescribedbyId: 'external-desc' })} />);
    expect(container).toMatchSnapshot('fieldset_required');
  });

  it('should render input select component with error message (div container)', () => {
    const { container } = render(<InputSelect {...getCommonProps({ errorMessage: 'This is an error.' })} />);
    expect(container).toMatchSnapshot('div_with_error_message');
  });

  it('should render input select component with error message (fieldset container)', () => {
    const { container } = render(
      <InputSelect {...getCommonProps({ ariaDescribedbyId: 'external-desc', errorMessage: 'This is an error.' })} />,
    );
    expect(container).toMatchSnapshot('fieldset_with_error_message');
  });

  it('should render input select with both help and error messages (div container)', () => {
    const { container } = render(
      <InputSelect
        {...getCommonProps({
          errorMessage: 'An error occurred.',
          helpMessage: 'More info here.',
        })}
      />,
    );
    expect(container).toMatchSnapshot('div_with_help_and_error');
  });

  it('should render input select with both help and error messages (fieldset container)', () => {
    const { container } = render(
      <InputSelect
        {...getCommonProps({
          ariaDescribedbyId: 'external-desc',
          errorMessage: 'An error occurred.',
          helpMessage: 'More info here.',
        })}
      />,
    );
    expect(container).toMatchSnapshot('fieldset_with_help_and_error');
  });

  it('should render correctly when label is empty and no ariaDescribedbyId (div container)', () => {
    const { container } = render(
      <InputSelect
        id="empty-label-id"
        name="test"
        label=""
        aria-label="Test aria label"
        defaultValue="first"
        options={defaultOptions}
      />,
    );
    expect(container).toMatchSnapshot('empty_label_div');
  });

  it('should render correctly when label is empty but ariaDescribedbyId is present (fieldset container)', () => {
    const { container } = render(
      <InputSelect
        id="empty-label-fieldset-id"
        name="test"
        label=""
        aria-label="Test aria label"
        ariaDescribedbyId="external-desc"
        defaultValue="first"
        options={defaultOptions}
      />,
    );
    expect(container).toMatchSnapshot('empty_label_fieldset');
  });
});
