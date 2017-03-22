import React from 'react';
import renderer from 'react-test-renderer';
import _ from 'underscore';

import { Pager } from 'components';

const TEST_ARRAY = _.range(0, 100);

it('renders without crashing', () => {
  const pager = (
    <Pager
      array={TEST_ARRAY}
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
