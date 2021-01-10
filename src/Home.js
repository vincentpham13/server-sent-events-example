import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import Axios from 'axios';

const baseUrl = 'http://localhost:4000';

const axios = Axios.create();
axios.defaults.baseURL = baseUrl;
axios.defaults.headers.post['Content-Type'] = 'application/json';


const ListMessage = (props) => {
  const { messages } = props;
  return (<div className="list-wrapper">
    <ul>
      {messages.map((msg) =>
        <li
          className="number"
          key={msg.id}>
          Time: {new Date(msg.id).toLocaleTimeString()}, Got number: {msg.number}
        </li>)}
    </ul>
  </div>)
}

const useEventSource = () => {
  const [message, setMessage] = useState();
  useEffect(() => {
    const eventSource = new EventSource(
      `${baseUrl}/stream-random-number`,
      {
        withCredentials: false
      },
    );

    eventSource.onopen = (e) => {
      console.log('The connection was established');
    };

    eventSource.addEventListener('random_number', (messageEvent) => {
      const msg = JSON.parse(messageEvent.data);
      setMessage(msg);
    });

    eventSource.onerror = (e) => {
      console.log('The connection was closed');
    }

    return () => eventSource.removeEventListener('random_number');
  }, []);

  return message;
}

const Home = () => {
  const [messages, setMessages] = useState([]);
  const message = useEventSource();

  useEffect(() => {
    if (message) {
      setMessages([
        message,
        ...messages
      ])
    }
  }, [message]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <ul style={{ listStyleType: 'none' }}>
        {messages.map((msg) =>
          <li
            style={{ height: '30px'}}
            key={msg.id}>
            Time: {new Date(msg.id).toLocaleTimeString()}, got the number: {msg.number}
          </li>)}
      </ul>
    </div>
  );
}

export default withRouter(Home);
