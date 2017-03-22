import React from 'react';
import renderer from 'react-test-renderer';

import { Home } from 'views';

it('renders without crashing', () => {
    renderer.create(
        <Home
            onChangeRoute={() => {}}
        />
    );
});
