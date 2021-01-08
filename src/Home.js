import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Axios from 'axios';

const baseUrl = 'http://localhost:4000/v1';

const axios = Axios.create();
axios.defaults.baseURL = baseUrl;
axios.defaults.headers.post['Content-Type'] = 'application/json';

class Home extends Component {

  constructor(props) {
    super(props);

  }

  render() {
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div>
          <h1>Welcome</h1>
        </div>
      </div>
    );
  }
}

export default withRouter(Home);
