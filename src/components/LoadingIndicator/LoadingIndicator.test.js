import React from 'react';
import ReactDOM from 'react-dom';

import { LoadingIndicator } from 'components';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<LoadingIndicator />, div);
});
