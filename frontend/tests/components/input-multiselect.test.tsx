import type { ComponentProps } from 'react';

import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { InputMultiSelect } from '~/components/input-multiselect';
import type { InputMultiSelectProps } from '~/components/input-multiselect';

// --- 1. Mock all dependencies ---

// Mock FontAwesomeIcon to simplify testing

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: (props: { icon: { iconName: string } }) => <i data-icon={props.icon.iconName} />,
}));

// Mock child components to isolate the component under test
vi.mock('~/components/input-label', () => ({
  InputLabel: (props: ComponentProps<'label'>) => <label {...props}>{props.children}</label>,
}));
vi.mock('~/components/input-error', () => ({
  InputError: (props: ComponentProps<'span'>) => <span {...props}>{props.children}</span>,
}));
vi.mock('~/components/input-help', () => ({
  InputHelp: (props: ComponentProps<'p'>) => <p {...props}>{props.children}</p>,
}));
vi.mock('~/components/input-checkbox', () => ({
  InputCheckbox: ({ children, ...props }: ComponentProps<'input'>) => (
    <div>
      <input type="checkbox" {...props} />
      <label>{children}</label>
    </div>
  ),
}));

// --- 2. Test Suite Setup ---

const MOCK_OPTIONS = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'Svelte', value: 'svelte' },
];

describe('InputMultiSelect', () => {
  let onChange: ReturnType<typeof vi.fn>;
  let defaultProps: InputMultiSelectProps;

  beforeEach(() => {
    onChange = vi.fn();
    defaultProps = {
      id: 'framework',
      name: 'frameworks',
      label: 'Favorite Frameworks',
      options: MOCK_OPTIONS,
      value: [],
      onChange,
    };
  });

  const renderComponent = (props: Partial<InputMultiSelectProps> = {}) => {
    return render(<InputMultiSelect {...defaultProps} {...props} />);
  };

  // --- 3. Tests ---

  it('should render correctly with a placeholder', () => {
    renderComponent({ placeholder: 'Choose one...' });
    expect(screen.getByText('Favorite Frameworks')).toBeTruthy();
    expect(screen.getByText('Choose one...')).toBeTruthy();
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('should toggle the dropdown on button click', async () => {
    const user = userEvent.setup();
    renderComponent();

    const triggerButton = screen.getByRole('button', { name: 'Favorite Frameworks' });
    expect(triggerButton.getAttribute('aria-expanded')).toBe('false');

    await user.click(triggerButton);
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(triggerButton.getAttribute('aria-expanded')).toBe('true');

    await user.click(triggerButton);
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('should call onChange when selecting an option', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Svelte'));

    expect(onChange).toHaveBeenCalledWith(['svelte']);
  });

  it('should select an option with the Enter key', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button'));
    const vueOption = screen.getByText('Vue').closest('div[role="option"]');

    expect(vueOption).toBeInstanceOf(HTMLElement);
    (vueOption as HTMLElement).focus();

    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(['vue']);
  });

  it('should render an error message and apply error styles', () => {
    renderComponent({ errorMessage: 'This field is required' });
    expect(screen.getByText('This field is required')).toBeTruthy();
    const button = screen.getByRole('button');
    expect(button.className).toContain('border-red-500');
  });

  it('should be disabled when the disabled prop is true', () => {
    renderComponent({ disabled: true });
    const button = screen.getByRole('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should render multiple hidden inputs for form submission', () => {
    const { container } = renderComponent({ value: ['react', 'svelte'] });

    const hiddenInputs = container.querySelectorAll('input[type="hidden"][name="frameworks"]');
    expect(hiddenInputs).toHaveLength(2);

    const values = Array.from(hiddenInputs).map((input) => (input as HTMLInputElement).value);
    expect(values).toEqual(['react', 'svelte']);
  });

  it('should match the initial snapshot', () => {
    const { container } = renderComponent();
    expect(container).toMatchSnapshot();
  });
});
