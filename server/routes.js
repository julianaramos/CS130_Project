const express = require('express')
const firebase = require('firebase')
const plantuml_encoder = require('plantuml-encoder');
const axios = require('axios');
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

router.post('/delete-uml', async(req, res) => {
    uid = req.body.uid;
    uml_id = req.body.uml_id;

    try{
        await firebase.firestore().runTransaction(async (t) => {

            // Get the savedUML of a user
            const userRef = firebase.firestore().collection("User").doc(uid);
            const userDoc = await t.get(userRef);
            const savedUML = userDoc.data().savedUML;

            // get the uml document to delete
            const umlRef = firebase.firestore().collection("UML").doc(uml_id);

            // Delete the refernce
            t.delete(umlRef);

            // Remove the uml_id from the user's saved Uml
            savedUML.splice(savedUML.findIndex(p => p === uml_id, 1));
            t.update(userRef, { savedUML: savedUML });


        });
        res.status(200).send("Successly deleted uml doc");
    }
    catch (error){
        res.status(503).send("Could not delete uml, changes to db were not saved.");
    }
});

router.post('/fetch-plant-uml', async(req, res) => {
    // Default behavior is to return raw data, not as URI
    const { uml_code, response_type, return_as_uri = false } = req.body;
    let file_type;

    // Require parameters: url_code, response_type
    if (!uml_code || !response_type) {
        return res.status(401).send({ type: 'MissingInput', message: 'Both uml_code and response_type are required as non-empty parameters.' });
    }

    // uml_code must be a string
    if (typeof uml_code !== 'string') {
        return res.status(400).send({ type: 'InvalidInput', message: 'uml_code must be a string.' });
    }

    // response_type must be "SVG" or "PNG"
    if (response_type !== 'SVG' && response_type !== 'PNG') {
        return res.status(400).send({ type: 'InvalidInput', message: 'response_type must be "SVG" or "PNG".' });
    }

    // return_as_uri must be a boolean (default false)
    if (typeof return_as_uri !== 'boolean') {
        return res.status(400).send({ type: 'InvalidInput', message: 'return_as_uri must be a boolean (default false).' });
    }

    // Encode UML source code into PlantUML link
    const encoded_source = plantuml_encoder.encode(uml_code);
    const plant_uml_link = `http://www.plantuml.com/plantuml/${response_type.toLowerCase()}/${encoded_source}`;

    // Retrieve diagram response from PlantUML server
    let diagram_response;
    try {
        const response = await axios.get(plant_uml_link, { responseType: 'arraybuffer', timeout: 5000 });
        diagram_response = response.data;
    }
    catch (error) {
        console.error(error);

        // Check for timeout error
        if (error.code === 'ECONNABORTED') {
            return res.status(500).send({ type: 'TimeoutError', message: 'The request timed out after 5 seconds.' });
        }

        // Check for invalid UML code error
        if (error?.response?.status === 400) {
            return res.status(400).send({ type: 'InvalidUMLCodeError', message: 'The provided UML code is not valid.' });
        }

        // Default error: server not available
        return res.status(500).send({ type: 'ServerError', message: 'The PlantUML server is unavailable.', error: error });
    }

    // Convert SVG or PNG to URI form if requested
    if (return_as_uri) {
        const base64 = Buffer.from(diagram_response, 'binary').toString('base64');
        const mime_type = response_type === 'SVG' ? 'image/svg+xml' : 'image/png';
        diagram_response = `data:${mime_type};base64,${base64}`;
    }

    return res.status(200).send(diagram_response);
});

module.exports = router;
