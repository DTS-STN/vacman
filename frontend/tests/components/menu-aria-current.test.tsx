import { createRoutesStub } from 'react-router';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Menu, MenuItem } from '~/components/menu';

describe('MenuItem aria-current functionality', () => {
  it('should add aria-current="page" when MenuItem file matches current route', async () => {
    const user = userEvent.setup();
    const RoutesStub = createRoutesStub([
      {
        path: '/en/employee',
        Component: () => (
          <Menu>
            <MenuItem file="routes/employee/index.tsx">Dashboard</MenuItem>
            <MenuItem file="routes/hr-advisor/index.tsx">HR Dashboard</MenuItem>
          </Menu>
        ),
      },
    ]);

    render(<RoutesStub initialEntries={['/en/employee']} />);

    // Open the dropdown menu
    const menuTrigger = screen.getByRole('button');
    await user.click(menuTrigger);

    // The Dashboard MenuItem should have aria-current="page" since it matches the current route
    const dashboardLink = screen.getByRole('menuitem', { name: 'Dashboard' });
    expect(dashboardLink.getAttribute('aria-current')).toBe('page');

    // The HR Dashboard MenuItem should not have aria-current since it doesn't match
    const hrDashboardLink = screen.getByRole('menuitem', { name: 'HR Dashboard' });
    expect(hrDashboardLink.getAttribute('aria-current')).toBeNull();
  });

  it('should not add aria-current when MenuItem file does not match current route', async () => {
    const user = userEvent.setup();
    const RoutesStub = createRoutesStub([
      {
        path: '/en/hr-advisor',
        Component: () => (
          <Menu>
            <MenuItem file="routes/employee/index.tsx">Dashboard</MenuItem>
            <MenuItem file="routes/hr-advisor/index.tsx">HR Dashboard</MenuItem>
          </Menu>
        ),
      },
    ]);

    render(<RoutesStub initialEntries={['/en/hr-advisor']} />);

    // Open the dropdown menu
    const menuTrigger = screen.getByRole('button');
    await user.click(menuTrigger);

    // The Dashboard MenuItem should not have aria-current since it doesn't match the current route
    const dashboardLink = screen.getByRole('menuitem', { name: 'Dashboard' });
    expect(dashboardLink.getAttribute('aria-current')).toBeNull();

    // The HR Dashboard MenuItem should have aria-current="page" since it matches
    const hrDashboardLink = screen.getByRole('menuitem', { name: 'HR Dashboard' });
    expect(hrDashboardLink.getAttribute('aria-current')).toBe('page');
  });

  it('should respect explicitly set aria-current attribute', async () => {
    const user = userEvent.setup();
    const RoutesStub = createRoutesStub([
      {
        path: '/en/employee',
        Component: () => (
          <Menu>
            <MenuItem file="routes/employee/index.tsx" aria-current="step">
              Dashboard
            </MenuItem>
          </Menu>
        ),
      },
    ]);

    render(<RoutesStub initialEntries={['/en/employee']} />);

    // Open the dropdown menu
    const menuTrigger = screen.getByRole('button');
    await user.click(menuTrigger);

    // Should use the explicitly set aria-current value instead of auto-detecting
    const dashboardLink = screen.getByRole('menuitem', { name: 'Dashboard' });
    expect(dashboardLink.getAttribute('aria-current')).toBe('step');
  });

  it('should work with MenuItem using "to" prop instead of "file"', async () => {
    const user = userEvent.setup();
    const RoutesStub = createRoutesStub([
      {
        path: '/en/employee',
        Component: () => (
          <Menu>
            <MenuItem to="/external-link">External Link</MenuItem>
          </Menu>
        ),
      },
    ]);

    render(<RoutesStub initialEntries={['/en/employee']} />);

    // Open the dropdown menu
    const menuTrigger = screen.getByRole('button');
    await user.click(menuTrigger);

    // External links should not have aria-current since they don't have a file prop
    const externalLink = screen.getByRole('menuitem', { name: 'External Link' });
    expect(externalLink.getAttribute('aria-current')).toBeNull();
  });
});
