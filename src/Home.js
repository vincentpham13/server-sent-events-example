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
let socket, currentUser;

class Home extends Component {

  constructor(props) {
    super(props);

    this.state = {
      users: [],
      typingText: '',
      partnerId: '',
      conversation: [
        // {
        //   // id: 1,
        //   content: 'Hi',
        //   invitationId: 158,
        //   conversationId: 158,
        //   from: 'fc336925-33a6-435b-b6d2-952d7d01d0c9',
        //   to: '797adac158-7522-4101-b7b1-610fe158724923',
        //   metadata: {
        //     user: {
        //       _id: '797adac158-7522-4101-b7b1-610fe158724923',
        //       name: 'Foo'
        //     }
        //   }
        // },
        // {
        //   // id: 2,
        //   content: 'Hello',
        //   invitationId: 158,
        //   conversationId: 158,
        //   from: 'fc336925-33a6-435b-b6d2-952d7d01d0c9',
        //   to: '797adac158-7522-4101-b7b1-610fe158724923',
        //   metadata: {
        //     user: {
        //       _id: '797adac158-7522-4101-b7b1-610fe158724923',
        //       name: 'Bar'
        //     }
        //   }
        // },
      ]
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
      socket.disconnect();
    }.bind(this);

    socket.on('connect', (pong) => {
      console.log('connected');
      socket.emit('authentication', { token, deviceId });
    });

    socket.on('authenticated', (user) => {
      currentUser = user;
      const { users } = this.state;
      socket.emit('joinOnlineRoom');
      this.syncUser(users);
      // socket.emit('syncAllInvitations');
      // socket.emit('syncHistoricalMessages', 158);
    });

    socket.on('unauthorized', (reason) => {
      console.log('Unauthorized:', reason);

      socket.disconnect();
    });

    socket.on('disconnect', (reason) => {
      console.log(`Disconnected: ${reason}`);
      // this.props.history.push('/');
    });

    socket.on('likedMe', (user) => {
      console.log(`${JSON.stringify(user)} liked me`);
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
      socket.emit('syncUsersStatus', [
        '8e531ac2-1d66-4415-bfac-11cf85bca311'
      ]);
    });

    socket.on('respondInvite', (invite) => {
      console.log(`responded: ${JSON.stringify(invite)}.`);
    });

    socket.on('cancelInvite', (invite) => {
      console.log(`called: ${JSON.stringify(invite)}.`);
    });

    socket.on('readyForCall', (invite) => {
      console.log(`readyForCall: ${JSON.stringify(invite)}`)
    })
    socket.on('startCall', (invite) => {
      console.log(`startCall: ${JSON.stringify(invite)}`)
    })

    socket.on('receiveTimeslots', (timeslots) => {
      console.log(`receiveTimeslots: ${JSON.stringify(timeslots)}`)
    })

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
      console.log('matched', JSON.stringify(data));
    });

    socket.on('syncedUsersStatus', (users) => {
      console.log('syncedUsersStatus', users);
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
    });

    socket.on('syncedAllInvitations', (data) => {
      console.log('syncedAllInvitations', data);
    });

    socket.on('updateRemainingInvitations', (remaining) => {
      console.log('updateRemainingInvitations', remaining);
    });

    socket.on('syncedHistoricalMessages', (historicaMsgs) => {
      console.log('syncedHistoricalMessages', historicaMsgs);
      this.setState({ conversation: historicaMsgs })
    });

    socket.on('receiveMessage', (message) => {
      console.log('receiveMessage', message);
      const { conversation } = this.state;
      const msg = message;
      if (msg.to === currentUser.id) {
        conversation.push(msg)
        this.setState({ conversation: conversation })
      }
    });

    socket.on('sendMessageFailed', (error) => {
      console.log('sendMessageFailed', error);
    });

    socket.on('prepareForScheduledCall', (data) => {
      console.log('prepareForScheduledCall', data);
    });
    socket.on('readyForScheduledCall', (data) => {
      console.log('readyForScheduledCall', data);
    });
    socket.on('refreshRemainingInvitations', (data) => {
      console.log('refreshDailySuggestion', data);
    });
    socket.on('refreshRemainingInvitations', (data) => {
      console.log('refreshRemainingInvitations', data);
    });

    socket.on('changeInvitationVisibility', (data) => {
      console.log('changeInvitationVisibility', data);
    });

    socket.on('refreshLikeListProfiles', (data) => {
      console.log('refreshLikeListProfiles', data);
    });

    socket.on('readyForAnotherCall', (data) => {
      console.log('readyForAnotherCall', data);
    });
  }

  syncUser = (users) => {
    const userArr = users.map((u) => u.id);
    socket.emit('joinUsersRoom', userArr);
    socket.emit('syncUsersStatus', userArr);
    socket.emit('syncOnlineRoom', userArr);
  }

  refresh = () => {
    Axios.get(`${baseUrl}` + `/users/daily-suggestions`)
      .then((res) => {
        const userStatus = res.data.map(u => ({ ...u, status: 'offline' }));

        this.setState({
          users: userStatus
        });

        this.syncUser(res.data);
      })
      .catch((error) => console.log(error));
  }

  onPartnerIdChange = (e) => {
    const id = e.target.value;
    this.setState({
      partnerId: id
    })
  }

  onTyping = (e) => {
    const text = e.target.value;
    this.setState({
      typingText: text
    })
  }

  onKeyPress = (e) => {
    const { typingText, conversation, partnerId } = this.state;
    if (e.key === 'Enter') {
      // const latestMsg = conversation[conversation.length - 1];
      const msg = {
        // id: latestMsg.id + 1,
        type: 'text',
        content: typingText,
        invitationId: 158,
        conversationId: 158,
        from: currentUser.id,
        to: partnerId,
        // metadata: {
        //   user: {
        //     _id: currentUser.id,
        //     name: 'Foo'
        //   }
        // }
      };

      socket.emit('sendMessage', msg);
      console.log("Home -> onKeyPress -> msg", msg)
      conversation.push(msg);
      this.setState({ typingText: '', conversation: conversation });
    }
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

  proposeTimeslots = () => {
    const { partnerId } = this.state;
    const proposeTimeslots = {
      timezone: 'GMT+7',
      timeslots: [
        {
          day: '2020-08-21',
          time: 22
        }
      ]
    };

    const msg = {
      type: 'schedule',
      content: proposeTimeslots,
      invitationId: 158,
      from: currentUser.id,
      to: partnerId,
      metadata: {
        scheduleType: 'schedule-proposal'
      }
    };
    console.log("Home -> proposeTimeslots -> msg", msg)

    socket.emit('sendMessage', msg);
    // conversation.push(msg);
    // this.setState({ conversation: conversation });
  };

  pickTimeslots = () => {
    const { partnerId } = this.state;
    const pickedTimeslot =
    {
      timeslot: {
        day: '2020-08-21',
        time: 22,
        timezone: 'GMT+7'
      }
    }

    const msg = {
      type: 'schedule',
      content: pickedTimeslot,
      invitationId: 158,
      from: currentUser.id,
      to: partnerId,
      metadata: {
        scheduleType: 'schedule-selection'
      }
    };

    socket.emit('sendMessage', msg);
  };

  render() {
    const { users, typingText, partnerId } = this.state;

    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div>
          <h1>User list</h1>
          <button onClick={this.login}>Log me in</button>
          <button onClick={this.disconnect}>Logout</button>
          <button onClick={this.leaveOnlineRoom}>Leave Online Room</button>
          <button onClick={this.joinOnlineRoom}>Join Online Room</button>
          <button onClick={this.proposeTimeslots}>Propose timeslots</button>
          <button onClick={this.pickTimeslots}>Pick timeslot</button>
          {
            users.length && this.renderUser(users)
          }

          <h1>Chat conversation</h1>
          <ul>
            {
              // this.state.conversation.map(msg => (<li key={msg.id}>{msg.metadata && msg.metadata.user && msg.metadata.user.name} sent: {msg.content || msg.metadata.type}</li>))
            }
          </ul>
          <label htmlFor="partnerId">Chat with userId:</label>
          <input id="partnerId" type="text" value={partnerId} onChange={this.onPartnerIdChange} />
          <label htmlFor="typingText">Type:</label>
          <input id="typingText" type="text" value={typingText} onKeyPress={this.onKeyPress} onChange={this.onTyping} />
        </div>
      </div>
    );
  }
}

export default withRouter(Home);
