import React, { Component } from 'react'
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Query from './pages/Query'
import Test from './pages/Test';
import Dashboard from './pages/Dashboard';
import NavBar from './pages/NavBar';

class App extends Component {

    render() {
        return (
          <Router>
            <NavBar/>
            <Routes>
              <Route
                exact path={"/"}
                element = {<Home/>} />
              <Route
                exact path={"/signup"}
                element = {<Signup />}/>
              <Route
                exact path={"/login"}
                element = {<Login />}/>
              <Route
                exact path={"/query"}
                element = {<Query />}/>
              <Route
                exact path={"/test"}
                element = {<Test />}/>
              <Route
                exact path={"/dashboard"}
                element = {<Dashboard />}/>
            </Routes>
          </Router>
        )
    }
}

export default App