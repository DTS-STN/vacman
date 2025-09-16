import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { VacmanBackground } from '~/components/vacman-background';

describe('VacmanBackground', () => {
  it('should render vacman background component', () => {
    const { container } = render(<VacmanBackground>vacman background</VacmanBackground>);
    expect(container).toMatchSnapshot('expected html');
  });
  it('should render vacman background component with top-left variant', () => {
    const { container } = render(<VacmanBackground variant="top-left">top-left</VacmanBackground>);
    expect(container).toMatchSnapshot('expected html');
  });
  it('should render vacman background component with top-right variant', () => {
    const { container } = render(<VacmanBackground variant="top-right">top-right</VacmanBackground>);
    expect(container).toMatchSnapshot('expected html');
  });
  it('should render vacman background component with bottom-left variant', () => {
    const { container } = render(<VacmanBackground variant="bottom-left">bottom-left</VacmanBackground>);
    expect(container).toMatchSnapshot('expected html');
  });
  it('should render vacman background component with bottom-right variant', () => {
    const { container } = render(<VacmanBackground variant="bottom-right">bottom-right</VacmanBackground>);
    expect(container).toMatchSnapshot('expected html');
  });
  it('should render vacman background component at h-50', () => {
    const { container } = render(<VacmanBackground height="h-50">h-50</VacmanBackground>);
    expect(container).toMatchSnapshot('expected html');
  });
  it('should render vacman background component at h-60', () => {
    const { container } = render(<VacmanBackground height="h-60">h-60</VacmanBackground>);
    expect(container).toMatchSnapshot('expected html');
  });
  it('should render vacman background component at h-70', () => {
    const { container } = render(<VacmanBackground height="h-70">h-70</VacmanBackground>);
    expect(container).toMatchSnapshot('expected html');
  });
  it('should render vacman background component at h-80', () => {
    const { container } = render(<VacmanBackground height="h-80">h-80</VacmanBackground>);
    expect(container).toMatchSnapshot('expected html');
  });
  it('should render vacman background component at h-90', () => {
    const { container } = render(<VacmanBackground height="h-90">h-90</VacmanBackground>);
    expect(container).toMatchSnapshot('expected html');
  });
});
