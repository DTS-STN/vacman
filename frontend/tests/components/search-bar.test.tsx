import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SearchBar } from '~/components/search-bar';

describe('SearchBar', () => {
  it('should render search bar component', () => {
    const { container } = render(<SearchBar id="test-id" name="test" onSearch={() => {}} />);
    expect(container).toMatchSnapshot('expected html');
  });

  it('should render search bar suggestions', () => {
    const { container, getByLabelText } = render(
      <SearchBar
        id="test-id"
        name="test"
        onSearch={(search, setSuggestions) => {
          setSuggestions(['suggestion1', 'suggestion2']);
        }}
      />,
    );
    const input = getByLabelText('gcweb:search-bar.search');
    fireEvent.input(input, { target: { value: 'search test' } });
    expect(container).toMatchSnapshot('expected html');
  });
});
