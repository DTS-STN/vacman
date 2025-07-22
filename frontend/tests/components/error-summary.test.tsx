import { useActionData, useFetcher } from 'react-router';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { ActionDataErrorSummary, ErrorSummary, FetcherErrorSummary, FormErrorSummary } from '~/components/error-summary';

// Mock t function for i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown> | undefined) => {
      if (key === 'gcweb:error-summary.header') {
        return options && typeof options.count === 'number' && options.count === 1
          ? 'There is 1 error'
          : `There are ${options && typeof options.count === 'number' ? options.count : 0} errors`;
      }
      return key;
    },
  }),
}));

vi.mock('react-router', () => ({
  useFetcher: vi.fn(),
  useActionData: vi.fn(),
}));

// Mock AnchorLink for easier testing
vi.mock('~/components/links', () => ({
  AnchorLink: (props: { anchorElementId: string; children: React.ReactNode } & Record<string, unknown>) => {
    const { anchorElementId, children, ...rest } = props;
    return (
      <a href={`#${anchorElementId}`} {...rest}>
        {children}
      </a>
    );
  },
}));

describe('ErrorSummary', () => {
  it('renders null when there are no errors', () => {
    render(<ErrorSummary errors={[]} />);
    expect(document.documentElement).toMatchSnapshot('renders-null-when-no-errors');
  });

  it('renders error summary with multiple errors', () => {
    const errors = [
      { fieldId: 'first-name', errorMessage: 'First name is required' },
      { fieldId: 'last-name', errorMessage: 'Last name is required' },
    ];
    render(<ErrorSummary errors={errors} className="custom-class" data-testid="error-summary" />);
    expect(document.documentElement).toMatchSnapshot('renders-multiple-errors');
  });

  it('renders error summary with a single error', () => {
    const errors = [{ fieldId: 'email', errorMessage: 'Email is invalid' }];
    render(<ErrorSummary errors={errors} />);
    expect(document.documentElement).toMatchSnapshot('renders-single-error');
  });
});

describe('ActionDataErrorSummary', () => {
  // Helper to setup form DOM structure for error extraction
  function setupFormDom() {
    // input with aria-errormessage, error message div
    const input = document.createElement('input');
    input.id = 'username';
    input.setAttribute('aria-errormessage', 'username-error');

    const errorDiv = document.createElement('div');
    errorDiv.id = 'username-error';
    errorDiv.textContent = 'Username required';

    document.body.appendChild(input);
    document.body.appendChild(errorDiv);

    return {
      input,
      errorDiv,
      cleanup: () => {
        input.remove();
        errorDiv.remove();
      },
    };
  }

  it('displays errors from form DOM structure', () => {
    const { cleanup: domCleanup } = setupFormDom();

    render(
      <ActionDataErrorSummary actionData={{}}>
        <form>
          <input id="username" aria-errormessage="username-error" />
        </form>
      </ActionDataErrorSummary>,
    );

    expect(document.documentElement).toMatchSnapshot('action-data-error-summary-with-errors');
    domCleanup();
  });

  it('does not display errors if no invalid inputs in DOM', () => {
    render(
      <ActionDataErrorSummary actionData={{}}>
        <form>
          <input id="foo" />
        </form>
      </ActionDataErrorSummary>,
    );

    expect(document.documentElement).toMatchSnapshot('action-data-error-summary-no-errors');
  });
});

describe('FetcherErrorSummary', () => {
  it('displays errors from fetcher data', () => {
    const actionData = { errors: { field: ['Test error message'] } };
    const fetcherMock = mock<ReturnType<typeof useFetcher>>({ data: actionData });
    vi.mocked(useFetcher).mockReturnValue(fetcherMock);

    const { container } = render(
      <FetcherErrorSummary fetcherKey="test-fetcher">
        <div id="test-field" aria-errormessage="test-error">
          Test Field
        </div>
        <div id="test-error">{actionData.errors.field.at(0)}</div>
      </FetcherErrorSummary>,
    );

    expect(container).toMatchSnapshot('expected html');
  });
});

describe('FormErrorSummary', () => {
  it('displays errors from form action data', () => {
    const actionData = { errors: { field: ['Test error message'] } };
    vi.mocked(useActionData).mockReturnValue(actionData);

    const { container } = render(
      <FormErrorSummary>
        <div id="test-field" aria-errormessage="test-error">
          Test Field
        </div>
        <div id="test-error">{actionData.errors.field.at(0)}</div>
      </FormErrorSummary>,
    );

    expect(container).toMatchSnapshot('expected html');
  });
});
