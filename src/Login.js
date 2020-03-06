import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'
import './App.css';

class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiODJiOTdmMTQtNDFlOS00YmY0LWEzNTMtNjM5MWRhYjg4Y2Q0IiwiZW1haWwiOiJuaGF0cGhtQGRncm91cC5jbyIsImZ1bGxOYW1lIjoiWW91bmcgUGlsb3QiLCJiaXJ0aGRheSI6IjIwMDYtMDYtMTVUMTc6MDA6MDAuMDAwWiIsImdlbmRlcklkIjoxLCJwaG9uZSI6Iis1NCAzODggODUxIDMzMzIiLCJzb2NpYWxJZCI6IjIzNDIzMjE0MTIzMTI0MjQxNDEiLCJtZXRob2QiOiJhcHBsZSIsImlzUHJlbWl1bSI6ZmFsc2UsIm1ldGFkYXRhIjp7InBlbmRpbmdTdGVwIjpudWxsLCJpc1Byb2ZpbGVDb21wbGV0ZWQiOnRydWV9fSwiZGV2aWNlSWQiOiJkMjIyZWUiLCJpYXQiOjE1Nzg5MTE4NTQsImV4cCI6MTU3ODk5ODI1NH0.qdwUgqeLAE0CHlWx3U5lpWEWdpakLu7joF_4FDRkNL0',
      deviceId: 'd1',
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
