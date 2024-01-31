const express = require('express')
const firebase = require('firebase')
const router = express.Router()

router.post('/create-user', async (req, res) => {
    const data = req.body;
    await firebase.firestore().collection("User").add(data);
    res.send({msg: "User Added" });
});

router.post('/signup', async (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
    }

    try 
    {
        data = await firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password); 
        const UserInfo = {
            savedUML: []
        }
        await firebase.firestore().collection("User").doc(data.user.uid).set(UserInfo);
        res.send("user created");
    } 
    catch (error)
    {
        res.send(error);
    }
});

router.post('/login', async (req, res) => {
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

router.post('/create-new-uml', async(req, res) => {
    const umlData = {
        content: req.body.content,
        privacy: req.body.privacy,
        name: req.body.name
    }
    uid = req.body.uid;
    try{
        await firebase.firestore().runTransaction(async (t) => {

            // Get the savedUML of a user
            const userRef = firebase.firestore().collection("User").doc(uid);
            const userDoc = await t.get(userRef);
            const savedUML = userDoc.data().savedUML;

            // create new UML document (must generate doc reference and set instead of adding bc transaction does not support add)
            const umlRef = firebase.firestore().collection("UML").doc();
            t.set(umlRef, umlData);

            // update user's savedUML array with new document ID
            savedUML.push(umlRef.id);
            t.update(userRef, { savedUML: savedUML });
        });
        res.status(200).send("Successly added new uml doc");
    }
    catch (error){
        res.status(503).send("Could not create new uml, changes to db were not saved.")
    }
});

router.post('/copy-uml', async(req, res) => {
    uml_id = req.body.uml_id;
    uid = req.body.uid;

    try{
        await firebase.firestore().runTransaction(async (t) => {
            // Get the savedUML of a user
            const userRef = firebase.firestore().collection("User").doc(uid);
            const userDoc = await t.get(userRef);
            const savedUML = userDoc.data().savedUML;

            // get the uml document to copy
            const umlRef = firebase.firestore().collection("UML").doc(uml_id);
            const umlDoc = await t.get(umlRef);

            // create new uml with the proper content
            const newUmlData = {
                content: umlDoc.data().content,
                privacy: 'public',
                name:  umlDoc.data().name + '-copy'
            }

            const newUmlRef = firebase.firestore().collection("UML").doc();
            t.set(newUmlRef, newUmlData);

            // update user's savedUML array with new document ID
            savedUML.push(newUmlRef.id);
            t.update(userRef, { savedUML: savedUML });
        });
        res.status(200).send("Successly copied uml doc");
    }
    catch (error){
        res.status(503).send("Could not copy uml, changes to db were not saved.");
    }
});

router.post('/update-uml', async(req, res) => {
    uml_id = req.body.uml_id;
    newContent = req.body.content;
    newPrivacy = req.body.privacy;
    newName = req.body.name;

    try{
        await firebase.firestore().runTransaction(async (t) => {

            // get the uml document to update
            const umlRef = firebase.firestore().collection("UML").doc(uml_id);

            // create new uml with the proper content
            const newUmlData = {
                content: newContent,
                privacy: newPrivacy,
                name:  newName
            }

            // set existing uml ref
            t.set(umlRef, newUmlData);

        });
        res.status(200).send("Successly updated uml doc");
    }
    catch (error){
        res.status(503).send("Could not update uml, changes to db were not saved.");
    }
});


module.exports = router;
