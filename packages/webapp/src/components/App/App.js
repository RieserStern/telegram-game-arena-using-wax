import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { Header, Footer } from 'components';
import { I18nProvider } from 'i18n';
import { AppStateProvider } from '../AppStateProvider';
import './App.scss';

import Home from 'containers/Home';
import Items from 'containers/Items';
import Heroes from 'containers/Heroes';
import Hero from 'containers/Hero';
import Games from 'containers/Games';
import Chronicles from 'containers/Chronicles';
import Wallet from 'containers/Wallet';
import Bank from 'containers/Bank';

function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <AppStateProvider>
          <div className="app-container">
            <Header />

            <main className="main">
              <Switch>
                <Route exact path="/">
                  <Home />
                </Route>
                <Route exact path="/items">
                  <Items />
                </Route>
                <Route exact path="/heroes">
                  <Heroes />
                </Route>
                <Route exact path="/heroes/:id">
                  <Hero />
                </Route>

                <Route exact path="/games">
                  <Games />
                </Route>

                <Route exact path="/chronicles">
                  <Chronicles />
                </Route>

                <Route exact path="/wallet">
                  <Wallet />
                </Route>

                <Route exact path="/bank">
                  <Bank />
                </Route>
              </Switch>
            </main>

            <Footer />
          </div>
        </AppStateProvider>
      </I18nProvider>
    </BrowserRouter>
  );
}

export default App;
