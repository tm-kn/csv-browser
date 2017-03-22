import React from 'react';
import renderer from 'react-test-renderer';

import { SearchBox } from 'components';

it('renders without crashing', () => {
  const tree = renderer.create(<SearchBox value={''} onChange={() => {}}/>);
  
  expect(tree.toJSON()).toMatchSnapshot();
});
