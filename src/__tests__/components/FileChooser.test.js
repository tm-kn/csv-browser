import React from 'react';
import renderer from 'react-test-renderer';

import { FileChooser } from 'components';

it('renders without crashing', () => {
  const tree = renderer.create(<FileChooser onChangeFile={() => {}} />);

  expect(tree.toJSON()).toMatchSnapshot();
});
