import React from 'react';
import renderer from 'react-test-renderer';

import { FileHashCheck } from 'views';

it('renders without crashing', () => {
    renderer.create(<FileHashCheck />);
});
