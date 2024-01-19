const firebase = require('firebase');
const express = require('express')
const cors = require('cors')

const firebaseConfig = {
    apiKey: "AIzaSyB3boZBkBB2Dm2mH8G5ZWmdJiqrwOdq6zI",
    authDomain: "cs-130-project-4a50e.firebaseapp.com",
    projectId: "cs-130-project-4a50e",
    storageBucket: "cs-130-project-4a50e.appspot.com",
    messagingSenderId: "778681514699",
    appId: "1:778681514699:web:41ee99f72d206c8524394e",
    measurementId: "G-QN029G6K4X"
  };

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const User = db.collection("User");

const app = express()
app.use(express.json())
app.use(cors())

app.post('/create-user', async (req, res) => {
    const data = req.body;
    await User.add(data);
    res.send({msg: "User Added" });
});

app.post('/signup', async (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
    }

    // TODO VALIDATE DATA

    try 
    {
        data = await firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);

        const UserInfo = {
            uid: data.user.uid,
            savedUML: []
        }
        await User.add(UserInfo);
        res.send("User successfully added");
    } 
    catch (error) 
    {
        res.send(error);
    }
});

app.post('/login', async (req, res) => {
    const fields = {
        email: req.body.email,
        password: req.body.password,
    }

    // TODO VALIDATE DATA

    try 
    {
        data = await firebase.auth().signInWithEmailAndPassword(fields.email, fields.password);
        res.send("Sign in successful");
    } 
    catch (error) 
    {
        res.send(error);
    }
});

app.listen(4000, ()=>console.log("Running on port 4000"))
