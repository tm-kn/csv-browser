import React from 'react';
import renderer from 'react-test-renderer';

import { Pager } from 'components';

it('renders without crashing', () => {
  const pager = (
    <Pager
      array={[]}
      offset={15}
      onChangeArray={() => {}}
      onChangePage={() => {}}
      onChangeOffset={() => {}}
      page={1}
    />
  );
  
  const tree = renderer.create(pager);

  expect(tree.toJSON()).toMatchSnapshot();
});
