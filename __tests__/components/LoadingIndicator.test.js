import React from 'react';
import renderer from 'react-test-renderer';

import { LoadingIndicator } from 'components';

it('renders without crashing', () => {
  const tree = renderer.create(<LoadingIndicator />);

  expect(tree.toJSON()).toMatchSnapshot();
});
