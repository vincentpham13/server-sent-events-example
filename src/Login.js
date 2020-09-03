import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'
import './App.css';

class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      token: '',
      deviceId: 'iPhone12Pro',
    }
  }

  componentDidMount() {

  }

  onTokenChange = (e) => {
    const token = e.target.value;
    this.setState({
      token: token
    })
  };

  onDeviceIdChange = (e) => {
    const deviceId = e.target.value;
    this.setState({
      deviceId: deviceId
    })
  }

  onSubmit = (e) => {
    const { token, deviceId } = this.state;
    this.props.history.push('/home', { token, deviceId });
  };

  render() {
    const { token, deviceId } = this.state;
    return (
      <div className="App">
        <h1>Socket Client</h1>
        <div>
          <label htmlFor="token">Token:</label>
          <input id="token" type="text" value={token} onChange={this.onTokenChange} />
          <br/>
          <label htmlFor="deviceId">DeviceId:</label>
          <input id="deviceId" type="text" value={deviceId} onChange={this.onDeviceIdChange} />
          <br/>
          <button id="login" onClick={this.onSubmit}>Login</button>
        </div>
      </div>
    );
  }
}

export default withRouter(Login);
