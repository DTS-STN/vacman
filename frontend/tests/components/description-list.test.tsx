import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DescriptionListItem } from '~/components/description-list';

describe('DescriptionListItem', () => {
  it('should render description list item component', () => {
    const { container } = render(
      <DescriptionListItem id="id" term="term">
        description list item
      </DescriptionListItem>,
    );
    expect(container).toMatchSnapshot('expected html');
  });
});
