import type { ComponentProps } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { InputMultiSelectProps } from '~/components/input-multiselect';
import { InputMultiSelect } from '~/components/input-multiselect';

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: (props: { icon: { iconName: string } }) => <i data-icon={props.icon.iconName} />,
}));
vi.mock('~/components/input-legend', () => ({
  InputLegend: (props: ComponentProps<'legend'>) => <legend {...props}>{props.children}</legend>,
}));
vi.mock('~/components/input-error', () => ({
  InputError: (props: ComponentProps<'span'>) => <span {...props}>{props.children}</span>,
}));
vi.mock('~/components/input-help', () => ({
  InputHelp: (props: ComponentProps<'p'>) => <p {...props}>{props.children}</p>,
}));
vi.mock('~/components/input-checkbox', () => ({
  InputCheckbox: ({
    children,
    onChange,
    checked,
    hasError,
    ...props
  }: ComponentProps<'input'> & { children: React.ReactNode; hasError?: boolean }) => (
    <label>
      <input type="checkbox" {...props} checked={!!checked} onChange={onChange} />
      {children}
    </label>
  ),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, options?: { count?: number }) => `${options?.count} items selected`,
  }),
}));

const MOCK_OPTIONS = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'Svelte', value: 'svelte' },
];

describe('InputMultiSelect', () => {
  let defaultProps: InputMultiSelectProps;
  let onChangeMock: InputMultiSelectProps['onChange'];

  beforeEach(() => {
    onChangeMock = vi.fn();
    defaultProps = {
      id: 'framework',
      name: 'frameworks',
      legend: 'Favorite Frameworks',
      options: MOCK_OPTIONS,
      value: [],
      onChange: onChangeMock,
      placeholder: 'Choose a framework...',
    };
  });

  const setup = (props: Partial<InputMultiSelectProps> = {}) => {
    const user = userEvent.setup();
    render(<InputMultiSelect {...defaultProps} {...props} />);
    return { user };
  };

  it('should display the correct text based on selection', () => {
    const { rerender } = render(<InputMultiSelect {...defaultProps} value={[]} />);
    expect(screen.getByText('Choose a framework...')).toBeTruthy();

    rerender(<InputMultiSelect {...defaultProps} value={['react']} />);
    expect(screen.getByText('React')).toBeTruthy();

    rerender(<InputMultiSelect {...defaultProps} value={['react', 'svelte']} />);
    expect(screen.getByText('2 items selected')).toBeTruthy();
  });

  it('should render help and error messages when provided', () => {
    setup({
      errorMessage: 'This field is required.',
      helpMessage: 'Select at least one option.',
    });

    expect(screen.getByText('This field is required.')).toBeTruthy();
    expect(screen.getByText('Select at least one option.')).toBeTruthy();

    const trigger = screen.getByRole('button');
    const error = screen.getByText('This field is required.');

    expect(trigger.classList.contains('border-red-500')).toBe(true);
    expect(error.getAttribute('id')).toBe(`${defaultProps.id}-error`);
  });

  it('should be disabled when the disabled prop is true', () => {
    setup({ disabled: true });
    const trigger = screen.getByRole('button') as HTMLButtonElement;
    expect(trigger.disabled).toBe(true);
  });

  it('should toggle the dropdown when the trigger is clicked', async () => {
    const { user } = setup();
    const trigger = screen.getByRole('button', { name: 'Choose a framework...' });

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('checkbox')).toBeNull();

    await user.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByLabelText('React')).toBeTruthy();

    await user.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('should select and deselect options correctly', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button'));

    const svelteCheckbox = screen.getByLabelText('Svelte');
    const reactCheckbox = screen.getByLabelText('React');

    await user.click(svelteCheckbox);
    await user.click(reactCheckbox);

    expect(onChangeMock).toHaveBeenCalledWith(expect.arrayContaining(['svelte']));
    expect(onChangeMock).toHaveBeenCalledWith(expect.arrayContaining(['react']));

    await user.click(svelteCheckbox);
    expect(onChangeMock).toHaveBeenCalledWith(['react']);
  });

  it('should close the dropdown when the "Escape" key is pressed and focus the trigger', async () => {
    const { user } = setup();
    const trigger = screen.getByRole('button');

    await user.click(trigger);
    expect(screen.getByLabelText('React')).toBeTruthy();

    await user.keyboard('{Escape}');

    expect(screen.queryByLabelText('React')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
