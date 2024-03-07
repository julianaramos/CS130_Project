const express = require('express');
const cors = require('cors')
const router = require('./routes');
const firebase = require('firebase');

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(cors())
app.use('/', router);



const firebaseConfigOld = {
  apiKey: "AIzaSyB3boZBkBB2Dm2mH8G5ZWmdJiqrwOdq6zI",
  authDomain: "cs-130-project-4a50e.firebaseapp.com",
  projectId: "cs-130-project-4a50e",
  storageBucket: "cs-130-project-4a50e.appspot.com",
  messagingSenderId: "778681514699",
  appId: "1:778681514699:web:41ee99f72d206c8524394e",
  measurementId: "G-QN029G6K4X"
};

const firebaseConfig = {
  apiKey: "AIzaSyDXYw16VMQqdBEBEH-hklsCAFyY6dr2TBI",
  authDomain: "test-a0361.firebaseapp.com",
  projectId: "test-a0361",
  storageBucket: "test-a0361.appspot.com",
  messagingSenderId: "603764159112",
  appId: "1:603764159112:web:1863f29ba973b971baa53d"
};
  
firebase.initializeApp(firebaseConfig);

module.exports = app