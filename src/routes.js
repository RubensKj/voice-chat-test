import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

// Pages
import Card from './components/Card';

const Routes = () => (
  <BrowserRouter>
    <Switch>
      <Route path='/:channel' component={Card} />
    </Switch>
  </BrowserRouter>
);

export default Routes;