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
});
