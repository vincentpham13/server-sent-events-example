import React from 'react';
import { Switch, Route, Router } from 'react-router-dom'
import './App.css';

import Login from './Login';
import Home from './Home';

import history  from './history';

const App = () => (
  <Router history={history}>
    <Switch>
      <Route exact path="/">
        <Login />
      </Route>
      <Route path="/home">
        <Home />
      </Route>
    </Switch>
  </Router>
)

export default App;
