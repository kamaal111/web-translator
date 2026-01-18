import { within } from '@testing-library/react';

import { queries } from './queries';

const screen = within(document.body, queries);

export { screen };
