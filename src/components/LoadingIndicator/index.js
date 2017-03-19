import React, { Component } from 'react';

import './loading-indicator.css';
import image from './loading-image.svg';

export default class LoadingIndicator extends Component {
  render() {
    return (
      <div className="Loading-container">
        <img
          alt="Loading indicator"
          src={image}
          className="Loading-indicator"
        />
        <h2>Loading...</h2>
      </div>
    );
  }
}
