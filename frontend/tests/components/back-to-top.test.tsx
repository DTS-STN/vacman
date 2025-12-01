import { createRoutesStub } from 'react-router';

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BackToTop } from '~/components/back-to-top';

describe('BackToTop', () => {
  it('renders back to top link', () => {
    const RoutesStub = createRoutesStub([
      {
        Component: () => <BackToTop />,
        path: '/fr/',
      },
    ]);
    const { container } = render(<RoutesStub initialEntries={['/fr/']} />);
    expect(container).toMatchSnapshot('expected html');
  });
});
