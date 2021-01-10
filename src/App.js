import React from 'react';
import { Switch, Route, Router } from 'react-router-dom'

import Login from './Login';
import Home from './Home';

import history  from './history';

const App = () => (
  <Router history={history}>
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>
      <Route path="/login">
        <Login />
      </Route>
    </Switch>
  </Router>
)

export default App;
