import { within } from '@testing-library/react';

import { queries } from './queries';

function customWithin(element: HTMLElement) {
  return within(element, queries);
}

export { customWithin as within };
