import { createRoutesStub, useRouteError } from 'react-router';

import { fireEvent, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AnchorLink, AppLink, InlineLink } from '~/components/links';
import type { AppError } from '~/errors/app-error';

describe('links', () => {
  beforeEach(() => {
    // suppress any errors that are logged by the 'should throw' tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('AppLink', () => {
    it('should render a link with a specified language when provided', () => {
      const RoutesStub = createRoutesStub([
        {
          path: '/',
          Component: () => (
            <AppLink file="routes/index.tsx" lang="en">
              This is a test
            </AppLink>
          ),
        },
      ]);

      const { container } = render(<RoutesStub initialEntries={['/']} />);

      expect(container).toMatchSnapshot('expected html');
    });

    it('should render a link with the current language if no specific language is provided', () => {
      const RoutesStub = createRoutesStub([
        {
          path: '/fr/',
          Component: () => <AppLink file="routes/index.tsx">This is a test</AppLink>,
        },
      ]);

      const { container } = render(<RoutesStub initialEntries={['/fr/']} />);

      expect(container).toMatchSnapshot('expected html');
    });

    it('should throw an error if no language is available', () => {
      const RoutesStub = createRoutesStub([
        {
          path: '/',
          Component: () => <AppLink file="routes/index.tsx">This is a test</AppLink>,
          ErrorBoundary: () => <>{(useRouteError() as AppError).msg}</>,
        },
      ]);

      const { container } = render(<RoutesStub initialEntries={['/']} />);

      expect(container).toMatchSnapshot('expected html');
    });

    it('should render a disabled link', () => {
      const RoutesStub = createRoutesStub([
        {
          path: '/en/',
          Component: () => (
            <AppLink disabled file="routes/index.tsx">
              This is a test
            </AppLink>
          ),
        },
      ]);

      const { container } = render(<RoutesStub initialEntries={['/en/']} />);

      expect(container).toMatchSnapshot('expected html');
    });
  });

  describe('AnchorLink', () => {
    it('should render anchor link component', () => {
      const { container } = render(
        <>
          <AnchorLink anchorElementId="id" onClick={vi.fn()}>
            click here
          </AnchorLink>
          <div id="id">Some content.</div>
        </>,
      );

      expect(container).toMatchSnapshot('expected html');
    });

    it('should scroll to the correct element', () => {
      HTMLElement.prototype.scrollIntoView = vi.fn();
      HTMLElement.prototype.focus = vi.fn();

      const { container, getByTestId } = render(
        <>
          <AnchorLink anchorElementId="id" onClick={vi.fn()}>
            click here
          </AnchorLink>
          <div id="id">Some content.</div>
        </>,
      );

      fireEvent.click(getByTestId('anchor-link'));

      expect(container).toMatchSnapshot('expected html');
      expect(HTMLElement.prototype.focus).toHaveBeenCalled();
      expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
    });

    it('should handle click event without an onClick callback', () => {
      HTMLElement.prototype.scrollIntoView = vi.fn();
      HTMLElement.prototype.focus = vi.fn();

      const { container, getByTestId } = render(
        <>
          <AnchorLink anchorElementId="id">click here</AnchorLink>
          <div id="id">Some content.</div>
        </>,
      );

      fireEvent.click(getByTestId('anchor-link'));

      expect(container).toMatchSnapshot('expected html');
      expect(HTMLElement.prototype.focus).toHaveBeenCalled();
      expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
    });
  });

  describe('InlineLink', () => {
    it('should correctly render an InlineLink when the file property is provided', () => {
      const RoutesStub = createRoutesStub([
        {
          path: '/fr/',
          Component: () => <InlineLink file="routes/index.tsx">This is a test</InlineLink>,
        },
      ]);

      const { container } = render(<RoutesStub initialEntries={['/fr/']} />);

      expect(container).toMatchSnapshot('expected html');
    });

    it('should correctly render an InlineLink when the to property is provided', () => {
      const RoutesStub = createRoutesStub([
        {
          path: '/fr/',
          Component: () => <InlineLink to="https://example.com/">This is a test</InlineLink>,
        },
      ]);

      const { container } = render(<RoutesStub initialEntries={['/fr/']} />);

      expect(container).toMatchSnapshot('expected html');
    });
  });
});
