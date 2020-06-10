import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'

import Axios from 'axios';
import ioClient from 'socket.io-client';

// const baseUrl = 'https://api-staging.beopen.app/v1';
// const socketUrl = 'https://api-staging.beopen.app';
const baseUrl = 'http://localhost:4000/v1';
const socketUrl = 'http://localhost:4000';

const axios = Axios.create();
axios.defaults.baseURL = baseUrl;
axios.defaults.headers.post['Content-Type'] = 'application/json';


const options = {
  reconnection: true,
  rememberUpgrade: true,
  transports: ['websocket'],
  secure: true,
  rejectUnauthorized: false,
  ws: true,
  requestTimeout: 4000,
  autoConnect: true
}
let socket;

class Home extends Component {

  constructor(props) {
    super(props);

    this.state = {
      users: [],
    }
  }

  componentDidMount() {
    const { token, deviceId } = this.props.location.state;

    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      this.refresh();

    }

    socket = ioClient(socketUrl, options);

    socket.connect();

    window.onbeforeunload = function () {
      console.log('test disconnect')
      socket.disconnect();
    }.bind(this);

    socket.on('connect', (pong) => {
      console.log('connected');
      socket.emit('authentication', { token, deviceId });
    });

    socket.on('authenticated', (user) => {
      const { users } = this.state;
      this.syncUser(users);
      socket.emit('joinOnlineRoom');
      console.log('authenticated and synced users', user);
    });

    socket.on('unauthorized', (reason) => {
      console.log('Unauthorized:', reason);

      socket.disconnect();
    });

    socket.on('disconnect', (reason) => {
      console.log(`Disconnected: ${reason}`);
      // this.props.history.push('/');
    });

    socket.on('matched', (data) => {
      console.log(`It's matched: ${data}`);
    });

    socket.on('likedMe', (userId) => {
      console.log(`${userId} liked me`);
    });

    socket.on('unliked', (userId) => {
      console.log(`${userId} unliked me`);
    });

    socket.on('imageVerified', (user) => {
      console.log(`${user} was verified.`);
    });

    socket.on('imageDenied', (user) => {
      console.log(`${user} was denied.`);
    });

    socket.on('receiveInvite', (invite) => {
      console.log(`received: ${JSON.stringify(invite)}.`);
    });

    socket.on('respondInvite', (invite) => {
      console.log(`responded: ${JSON.stringify(invite)}.`);
    });


    // socket.on('loggedIn', (userId) => {


    // });

    socket.on('offline', (userId) => {
      console.log(userId + 'just offline');

      const userStatus = this.state.users.map(u => {
        if (u.id === userId) {
          return { ...u, status: 'offline' };
        }

        return u;
      });

      this.setState({
        users: userStatus
      });
    });

    socket.on('leftOnlineRoom', (userId) => {
      // console.log(userId + 'just left online room');
    });

    socket.on('online', (userId) => {
      console.log(userId + ' just online');

      const userStatus = this.state.users.map(u => {
        if (u.id === userId) {
          return { ...u, status: 'online' };
        }

        return u;
      });

      this.setState({
        users: userStatus
      });
    });

    socket.on('matched', (data) => {
      console.log('matched', data);
    });

    socket.on('syncedDaily', (users) => {
      console.log('syncedDaily', users);
      const userStatus = this.state.users.map(u => {
        let temp;
        for (let i = 0; i < users.length; i++) {
          if (u.id === users[i].id) {
            temp = { ...u, status: users[i].status };
            break;
          }

          temp = { ...u, status: "offline" };
        }
        return temp;
      });

      this.setState({
        users: userStatus
      });
    });
    socket.on('syncedOnlineRoom', (users) => {
      console.log('syncedOnlineRoom', users);
      console.log(users);
    });

  }

  syncUser = (users) => {
    const userArr = users.map((u) => u.id);
    socket.emit('joinRooms', userArr);
    socket.emit('syncDaily', userArr);
    socket.emit('syncOnlineRoom', userArr);
  }

  refresh = () => {
    Axios.get(`${baseUrl}` + `/users/daily-suggestions`)
      .then((res) => {

        console.log(res.data);
        const userStatus = res.data.map(u => ({ ...u, status: 'offline' }));

        this.setState({
          users: userStatus
        });

        this.syncUser(res.data);
      })
      .catch((error) => console.log(error));
  }

  renderUser = (users) => (<div>
    <table>
      <thead>
        <tr>
          <th>id</th>
          <th>fullName</th>
          <th>email</th>
          <th>gender</th>
          <th>status</th>
          <th>like</th>
          <th>liked me</th>
        </tr>
      </thead>
      <tbody>
        {
          users.map(u => (<tr key={u.id}>
            <td>{u.id}</td>
            <td>{u.fullName}</td>
            <td>{u.email}</td>
            <td>{u.gender.label}</td>
            <td style={{ color: `${u.status == 'online' ? 'green' : 'red'}`, fontWeight: 'bold' }}>{u.status}</td>
            <td style={{ cursor: 'pointer', color: `${u.status == 'liked' ? 'pink' : 'gray'}`, fontWeight: 'bold' }}>liked him/her</td>
            <td style={{ color: `${u.status == 'likedme' ? 'pink' : 'gray'}`, fontWeight: 'bold' }}>liked me</td>
          </tr>)
          )
        }
      </tbody>
    </table>
  </div>);

  login = () => {
    socket.connect();
  };

  disconnect = () => {
    socket.disconnect();
    this.props.history.push('/');
  };

  leaveOnlineRoom = () => {
    socket.emit('leaveOnlineRoom');
    // this.props.history.push('/');
  };

  joinOnlineRoom = () => {
    socket.emit('joinOnlineRoom');
    // this.props.history.push('/');
  };

  render() {
    const { users } = this.state;

    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div>
          <h1>User list</h1>
          <button onClick={this.login}>Log me in</button>
          <button onClick={this.disconnect}>Logout</button>
          <button onClick={this.leaveOnlineRoom}>Leave Online Room</button>
          <button onClick={this.joinOnlineRoom}>Join Online Room</button>
          {
            users.length && this.renderUser(users)
          }
        </div>
      </div>
    );
  }
}

export default withRouter(Home);
