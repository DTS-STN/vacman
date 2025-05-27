import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SearchBar } from '~/components/search-bar';

describe('SearchBar', () => {
  it('should render search bar component', () => {
    const { container } = render(<SearchBar id="test-id" name="test" onSearch={() => {}} />);
    expect(container).toMatchSnapshot('expected html');
  });
});
