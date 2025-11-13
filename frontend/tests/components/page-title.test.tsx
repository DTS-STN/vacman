import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageTitle } from '~/components/page-title';

describe('PageTitle', () => {
  it('should render a h1 tag with default styles', () => {
    const { container } = render(<PageTitle>Test Title</PageTitle>);
    expect(container).toMatchSnapshot('expected html');
  });

  it('should render subtitle text within the main h1 heading', () => {
    render(<PageTitle subTitle="Referral request">Process information</PageTitle>);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain('Referral request');
    expect(heading.textContent).toContain('Process information');
    expect(screen.queryByRole('heading', { level: 2 })).toBeNull();
  });
});
