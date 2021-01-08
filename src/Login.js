import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'

import './App.css';

class Login extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  render() {
    return (
      <div className="App">
        <h1>Login</h1>
      </div>
    );
  }
}

export default withRouter(Login);
