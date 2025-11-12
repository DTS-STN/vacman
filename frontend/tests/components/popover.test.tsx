import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Popover,
  PopoverAnchor,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from '~/components/popover';

describe('Popover', () => {
  it('renders Popover component', () => {
    const { container } = render(
      <Popover>
        <PopoverTrigger />
        <PopoverAnchor />
        <PopoverPortal>
          <PopoverContent>
            <PopoverClose />
            <PopoverArrow />
          </PopoverContent>
        </PopoverPortal>
      </Popover>,
    );
    expect(container).toMatchSnapshot('expected html');
  });
});
