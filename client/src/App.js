import React, { Component } from 'react'
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'

class App extends Component {

    render() {
        return (
          <Router>
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
            </Routes>
          </Router>
        )
    }
}

export default App