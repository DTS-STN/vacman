import { createRoutesStub } from 'react-router';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AppBar } from '~/components/app-bar';
import { MenuItem } from '~/components/menu';

describe('AppBar', () => {
  const mockSetViewingAsRole = vi.fn();

  it('should correctly render an AppBar with a MenuItem when the file property is provided', () => {
    const RoutesStub = createRoutesStub([
      {
        path: '/fr/',
        Component: () => (
          <AppBar viewingAsRole="employee" setViewingAsRole={mockSetViewingAsRole}>
            <MenuItem file="routes/index.tsx">This is a test</MenuItem>
          </AppBar>
        ),
      },
    ]);

    const { container } = render(<RoutesStub initialEntries={['/fr/']} />);
    expect(container).toMatchSnapshot('expected html');
  });

  it('should correctly render an AppBar with a MenuItem when the to property is provided', () => {
    const RoutesStub = createRoutesStub([
      {
        path: '/fr/',
        Component: () => (
          <AppBar viewingAsRole="employee" setViewingAsRole={mockSetViewingAsRole}>
            <MenuItem to="https://example.com/">This is a test</MenuItem>
          </AppBar>
        ),
      },
    ]);

    const { container } = render(<RoutesStub initialEntries={['/fr/']} />);
    expect(container).toMatchSnapshot('expected html');
  });

  it('should render an AppBar with a name provided', () => {
    const RoutesStub = createRoutesStub([
      {
        path: '/fr/',
        Component: () => (
          <AppBar name="Test User" viewingAsRole="employee" setViewingAsRole={mockSetViewingAsRole}>
            <MenuItem file="routes/index.tsx">This is a test</MenuItem>
          </AppBar>
        ),
      },
    ]);

    const { container } = render(<RoutesStub initialEntries={['/fr/']} />);
    expect(container).toMatchSnapshot('expected html');
  });

  it('should render an AppBar with a profile item provided', () => {
    const RoutesStub = createRoutesStub([
      {
        path: '/fr/',
        Component: () => (
          <AppBar
            name="Test User"
            profileItems={<MenuItem file="routes/index.tsx">This is a test</MenuItem>}
            viewingAsRole="employee"
            setViewingAsRole={mockSetViewingAsRole}
          >
            <MenuItem file="routes/index.tsx">This is a test</MenuItem>
          </AppBar>
        ),
      },
    ]);
    const { container } = render(<RoutesStub initialEntries={['/fr/']} />);
    expect(container).toMatchSnapshot('expected html');
  });

  it('should render the "Viewing As" dropdown with employee role', () => {
    const RoutesStub = createRoutesStub([
      {
        path: '/fr/',
        Component: () => (
          <AppBar viewingAsRole="employee" setViewingAsRole={mockSetViewingAsRole}>
            <MenuItem file="routes/index.tsx">Test</MenuItem>
          </AppBar>
        ),
      },
    ]);

    const { container } = render(<RoutesStub initialEntries={['/fr/']} />);
    expect(container).toMatchSnapshot('expected html');
  });

  it('should render the "Viewing As" dropdown with hiring-manager role', () => {
    const RoutesStub = createRoutesStub([
      {
        path: '/fr/',
        Component: () => (
          <AppBar viewingAsRole="hiring-manager" setViewingAsRole={mockSetViewingAsRole}>
            <MenuItem file="routes/index.tsx">Test</MenuItem>
          </AppBar>
        ),
      },
    ]);

    const { container } = render(<RoutesStub initialEntries={['/fr/']} />);
    expect(container).toMatchSnapshot('expected html');
  });
});
