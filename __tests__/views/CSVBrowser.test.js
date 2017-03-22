import React from 'react';
import renderer from 'react-test-renderer';

import { CsvBrowser } from 'views';

it('renders without crashing', () => {
    renderer.create(<CsvBrowser />);
});
