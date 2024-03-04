const express = require('express');
const firebase = require('firebase');
const plantuml_encoder = require('plantuml-encoder');
const AssistantUtils = require('./assistantUtils');
const axios = require('axios');
const router = express.Router();
require('dotenv').config({ path: './.env' });

router.post('/test', async(req, res) => {
    //console.log(req.body);
    res.send('Test route');
});

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
    //VALIDATE DATA
    const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegEx.test(newUser.email)){
        return res.status(400).send("Invalid email address.")
    }
    if(newUser.password.length < 6){
        return res.status(400).send("Invalid password.")
    }    
    // validation for password and confirmpassword 
    if(newUser.password !== newUser.confirmPassword){
        res.status(400).send("Password does not match with confirm password. ")
    }
    try 
    {
        data = await firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
        const UserInfo = {
            savedUML: []
        }
        await firebase.firestore().collection("User").doc(data.user.uid).set(UserInfo);
        res.status(200).send(data);
    } 
    catch (error)
    {
        res.status(400).send(error);
    }
});

router.post('/login', async (req, res) => {
    const fields = {
        email: req.body.email,
        password: req.body.password,
    }

    //VALIDATE DATA
    const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegEx.test(fields.email)){
        return res.status(400).send("Invalid email address.")
    }
    if(fields.password.length < 6){
        return res.status(400).send("Invalid password.")
    }
    console.log(fields);
    try 
    {
        data = await firebase.auth().signInWithEmailAndPassword(fields.email, fields.password);
        res.status(200).send(data);
    } 
    catch (error) 
    {
        res.status(400).send(error);
        // console.log("In route", error);
        // console.error('Firebase Authentication Error:', error.code, error.message);
        // let errorMessage = 'Invalid email or password';

        // if (error.code === 'auth/user-not-found') {
        //     errorMessage = 'User not found';
        // } else if (error.code === 'auth/wrong-password') {
        //     errorMessage = 'Wrong password';
        // }

        // res.status(400).send({ error: errorMessage });
    }
});

router.post('/google-signup', async (req, res) => {
    const newUser = {
        uid: req.body.uid,
        email: req.body.email,
    };

    try {
        const existingUser = await firebase.firestore().collection("User").doc(newUser.uid).get();
        if (existingUser.exists) {
            return res.status(400).send("User already exists.");
        }

        const UserInfo = {
            savedUML: []
        };

        await firebase.firestore().collection("User").doc(newUser.uid).set(UserInfo);
        res.status(200).send(newUser);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post('/google-login', async (req, res) => {
    const curUser = {
        user: req.body.user,
        uid: req.body.uid
    };

    try {
        const existingUser = await firebase.firestore().collection("User").doc(curUser.uid).get();
        if (existingUser.exists) {
            res.status(200).send("User exists");
        } else {
            res.status(400).send("User does not exist");
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post('/get-user-uml', async(req,res) => {
    uid = req.body.uid;

    var res_obj = [];

    try{
        await firebase.firestore().runTransaction(async (t) => {

            // Get the savedUML of a user
            const userRef = firebase.firestore().collection("User").doc(uid);
            const userDoc = await t.get(userRef);
            const savedUML = userDoc.data().savedUML;

            for (const uml_id of savedUML)
            {
                const umlRef = firebase.firestore().collection("UML").doc(uml_id);
                var umlDoc = await t.get(umlRef);
                var umlData = umlDoc.data();
                umlData['uml_id'] = uml_id;
                res_obj.push(umlData);
            }
        });

        res_obj.sort((a,b) => b.timestamp - a.timestamp);
        res.status(200).send(res_obj);
    }
    catch (error){
        res.status(503).send("Could not get user's uml diagrams.")
    }



});

router.post('/get-uml', async(req,res) => {
    uid = req.body.uid;
    uml_id = req.body.uml_id;

    //console.log(req.body);

    var uml;

    try{
        await firebase.firestore().runTransaction(async (t) => {

            const umlRef = firebase.firestore().collection("UML").doc(uml_id);
            const umlDoc = await t.get(umlRef);
            uml = umlDoc.data();
        });
        //console.log(uml);
        res.status(200).send(uml);
    }
    catch (error){
        res.status(503).send("Could not get uml.")
    }



});

router.post('/get-all-uml', async(req,res) => {
    const c = req.body.c;
    const s = req.body.s;
    const u = req.body.u;
    const a = req.body.a;
    const seq = req.body.seq;
    const nameContains = req.body.nameContains;
    var uml_collection;

    const mapFunc = (doc) => {
        var obj = doc.data();
        obj['uml_id'] = doc.id
        return obj;
    }

    const filterFunc = (doc) => {
        const base = doc.privacy === 'public' && doc.diagram !== '';

        if (!base){
            return false;
        }

        if (nameContains != '' && !doc.name.toLowerCase().includes(nameContains.toLowerCase()))
        {
            return false;
        }

        //console.log(doc.content);
        const classPred = c && doc.content.includes("class");
        const statePred = s && doc.content.includes("[*]");
        const useCasePred = u && doc.content.includes("usecase");
        const activityPred = a && doc.content.includes("start\n");
        const sequencePred = seq && doc.content.includes("participant");

        //console.log (classPred, statePred, useCasePred, activityPred);

        return classPred || statePred || useCasePred || activityPred || sequencePred;
    }

    try{
        await firebase.firestore().runTransaction(async (t) => {
            const snapshot = await firebase.firestore().collection("UML").get();
            uml_collection = snapshot.docs.map(mapFunc).filter(filterFunc);
        });

        uml_collection.sort((a,b) => b.timestamp - a.timestamp);
        res.status(200).send(uml_collection);
    }
    catch (error){
        //console.log(error)
        res.status(400).send(error)
    }

});

router.post('/create-new-uml', async(req, res) => {
    const umlData = {
        content: req.body.content,
        privacy: req.body.privacy,
        name: req.body.name,
        description: req.body.description,
        timestamp: Date.now(),
        diagram: req.body.diagram,
    }
    uid = req.body.uid;
    let id;
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
            id = umlRef.id;
            savedUML.push(umlRef.id);
            t.update(userRef, { savedUML: savedUML });
        });
        res.status(200).send(id);
    }
    catch (error){
        //console.log(error);
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
                name:  umlDoc.data().name + '-copy',
                description: umlDoc.data().description,
                timestamp: Date.now(),
                diagram: umlDoc.data().diagram,
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
    newDesc = req.body.description;
    newDiagram = req.body.diagram;

    try{
        await firebase.firestore().runTransaction(async (t) => {

            // get the uml document to update
            const umlRef = firebase.firestore().collection("UML").doc(uml_id);

            // create new uml with the proper content
            const newUmlData = {
                content: newContent,
                privacy: newPrivacy,
                name:  newName,
                description: newDesc,
                timestamp: Date.now(),
                diagram: newDiagram
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

    try {
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
    catch (error) {
        res.status(503).send("Could not delete uml, changes to db were not saved.");
    }
});

router.post('/delete-account', async(req, res) => {
    uid = req.body.uid;

    try {
        var user = firebase.auth().currentUser;
        await user.delete();
        await firebase.firestore().runTransaction(async (t) => {

            // Get the savedUML of a user
            const userRef = firebase.firestore().collection("User").doc(uid);
            const userDoc = await t.get(userRef);
            const savedUML = userDoc.data().savedUML;

            for (const uml_id of savedUML)
            {
                const umlRef = firebase.firestore().collection("UML").doc(uml_id);
                t.delete(umlRef);
            }
            t.delete(userRef);
        });
        res.status(200).send("Successly deleted account");
    }
    catch (error) {
        console.log(error);
        res.status(400).send(error);
    }


});

router.post('/fetch-plant-uml', async(req, res) => {
    // Default behavior is to return raw data, not as URI
    const { uml_code, response_type, return_as_uri = false } = req.body;

    // Require parameters: url_code, response_type
    if (!uml_code || !response_type) {
        return res.status(400).json({ type: 'MissingInput', message: 'Both uml_code and response_type are required as non-empty parameters.' });
    }

    // uml_code must be a string
    if (typeof uml_code !== 'string') {
        return res.status(400).json({ type: 'InvalidInput', message: 'uml_code must be a string.' });
    }

    // response_type must be "SVG" or "PNG"
    if (response_type !== 'SVG' && response_type !== 'PNG') {
        return res.status(400).json({ type: 'InvalidInput', message: 'response_type must be "SVG" or "PNG".' });
    }

    // return_as_uri must be a boolean (default false)
    if (typeof return_as_uri !== 'boolean') {
        return res.status(400).json({ type: 'InvalidInput', message: 'return_as_uri must be a boolean (default false).' });
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
        // Check for timeout error
        if (error.code === 'ECONNABORTED') {
            return res.status(408).json({ type: 'TimeoutError', message: 'The request timed out after 5 seconds.' });
        }

        // Check for invalid UML code error
        if (error.response?.status === 400) {
            return res.status(400).json({ type: 'InvalidUMLCodeError', message: 'The provided UML code is not valid.' });
        }

        // Default error: server not available
        return res.status(500).json({ type: 'ServerError', message: 'The PlantUML server is unavailable.', error: error });
    }

    // Convert SVG or PNG to URI form if requested
    if (return_as_uri) {
        const base64 = Buffer.from(diagram_response, 'binary').toString('base64');
        const mime_type = response_type === 'SVG' ? 'image/svg+xml' : 'image/png';
        diagram_response = `data:${mime_type};base64,${base64}`;
    }

    return res.status(200).send(diagram_response);
});

// Aspect ratio is always maintained
router.post('/add-scale-to-uml', async(req, res) => {
    const {
        uml_code,       // UML source code string
        scale_width,    // width of generated image in pixels
        scale_height,   // height of generated image in pixels
                        // if both are provided, scale until one is reached
        max = false     // boolean: if true, can only scale down to fit; won't scale up to fit
    } = req.body;

    // Require url_code parameter
    if (!uml_code) {
        return res.status(400).json({ type: 'MissingInput', message: 'uml_code is required as non-empty parameter.' });
    }

    // Require at least one of scale_width and scale_height parameters
    if (!scale_width && !scale_height) {
        return res.status(400).json({ type: 'MissingInput', message: 'At least one of scale_width and scale_height is required as a parameter.' });
    }

    // uml_code must be a string
    if (typeof uml_code !== 'string') {
        return res.status(400).json({ type: 'InvalidInput', message: 'uml_code must be a string.' });
    }

    // scale_width must be an int if it exists
    if (scale_width !== undefined && !Number.isInteger(scale_width)) {
        return res.status(400).json({ type: 'InvalidInput', message: 'scale_width must be an int if it is passed.' });
    }

    // scale_height must be an int if it exists
    if (scale_height !== undefined && !Number.isInteger(scale_height)) {
        return res.status(400).json({ type: 'InvalidInput', message: 'scale_height must be an int if it is passed.' });
    }

    // max must be a boolean (default false)
    if (typeof max !== 'boolean') {
        return res.status(400).json({ type: 'InvalidInput', message: 'max must be a boolean (default false).' });
    }

    // Construct scale command based on parameters
    let scale_command = max ? 'scale max ' : 'scale ';

    if (scale_width && scale_height) {
        scale_command += `${scale_width}x${scale_height}`;
    }
    else if (scale_width) {
        scale_command += `${scale_width} width`;
    }
    else { // scale_height
        scale_command += `${scale_height} height`;
    }

    // Split UML code into lines
    let lines = uml_code.split('\n');

    // Find index of the @enduml line
    // May not be last line due to whitespace, but not responsibility of this route to ensure no content after @enduml
    let end_index = lines.findIndex(line => line.trim() === '@enduml');

    // @enduml must be present
    if (end_index === -1) {
        return res.status(400).json({ type: 'MissingEnduml', message: '@enduml must be present to indicate end of program.' });
    }

    // Insert scale command before @enduml line
    lines.splice(end_index, 0, scale_command);

    // Rejoin code
    const uml_code_with_scale = lines.join('\n');

    return res.status(200).send(uml_code_with_scale);
});

router.post('/query-assistant-code-generator', async(req, res) => {
    const {
        uml_code = null,    // current source code string from which AI will work; if empty, will generate from scratch
        prompt,             // prompt string from which code will be generated
        timeout = 60000,    // duration before query request times out (default 10 seconds)
    } = req.body;
    const assistant_id = process.env.CODE_GENERATOR_ASSISTANT_ID;
    let assistant_response;

    // Require prompt parameter
    if (!prompt) {
        return res.status(400).json({ type: 'MissingInput', message: 'prompt is required as non-empty parameter.' });
    }

    // url_code must be a string if it exists
    if (uml_code !== null && typeof uml_code !== 'string') {
        return res.status(400).json({ type: 'InvalidInput', message: 'uml_code must be a string if it is passed.' });
    }

    // prompt must be a string
    if (typeof prompt !== 'string') {
        return res.status(400).json({ type: 'InvalidInput', message: 'prompt must be a string.' });
    }

    // timeout must be an int if it exists
    if (timeout !== undefined && !Number.isInteger(timeout)) {
        return res.status(400).json({ type: 'InvalidInput', message: 'timeout must be an int if it is passed.' });
    }

    // Construct assistant prompt based on UML code and passed prompt
    const code_prompt = uml_code ?
        `Here is my current code:\n${uml_code}\n\nMake changes to the PlantUML code according to the following prompt:\n` :
        'Generate PlantUML code according to the following prompt:\n';
    const assistant_prompt = code_prompt + prompt;

    // Attempt to get response from assistant using helpers
    try {
        assistant_response = await AssistantUtils.handle_assistant_call(assistant_id, assistant_prompt, timeout);
    }
    catch (error) {
        // All thrown objects are of form { status, to_send } due to handler structure
        return res.status(error.status).json(error.to_send);
    }

    // Split the response into pre_code, uml_code, and post_code (everything after first @enduml)
    // The UML code starts with @startuml and ends with @enduml ([\s\S]*? matches all characters until the first @enduml)
    const [pre_code, uml_code_response, ...rest] = assistant_response.split(/(@startuml[\s\S]*?@enduml)/);
    const post_code = rest.join('');

    // Return an error if no complete code was generated
    if (!uml_code_response) {
        return res.status(500).json({ type: 'MissingSourceCode', message: 'Missing or incomplete source code message generated.' });
    }

    // Return the assistant response split by code
    return res.status(200).json({
        pre_code: pre_code.trim(),
        uml_code: uml_code_response.trim(),
        post_code: post_code.trim()
    });
});

router.post('/query-assistant-code-examiner', async(req, res) => {
    const {
        uml_code,           // current source code string AI will examine
        query,              // query string about code for assistant
        timeout = 10000,    // duration before query request times out (default 10 seconds)
    } = req.body;
    const assistant_id = process.env.CODE_EXAMINER_ASSISTANT_ID;
    let assistant_response;

    // Require uml_code parameter
    if (!uml_code) {
        return res.status(400).json({ type: 'MissingInput', message: 'uml_code is required as non-empty parameter.' });
    }

    // Require query parameter
    if (!query) {
        return res.status(400).json({ type: 'MissingInput', message: 'query is required as non-empty parameter.' });
    }

    // uml_code must be a string
    if (typeof uml_code !== 'string') {
        return res.status(400).json({ type: 'InvalidInput', message: 'uml_code must be a string.' });
    }

    // query must be a string
    if (typeof query !== 'string') {
        return res.status(400).json({ type: 'InvalidInput', message: 'query must be a string.' });
    }

    // timeout must be an int if it exists
    if (timeout !== undefined && !Number.isInteger(timeout)) {
        return res.status(400).json({ type: 'InvalidInput', message: 'timeout must be an int if it is passed.' });
    }

    // Construct assistant prompt based on UML code and passed query
    const assistant_prompt =
        `Here is my current code:\n${uml_code}\n\nAnswer this question based on the code:\n${query}`;

    // Attempt to get response from assistant using helpers
    try {
        assistant_response = await AssistantUtils.handle_assistant_call(assistant_id, assistant_prompt, timeout);
    }
    catch (error) {
        // All thrown objects are of form { status, to_send } due to handler structure
        return res.status(error.status).json(error.to_send);
    }

    // Return the assistant response split by code
    return res.status(200).send(assistant_response);
});

module.exports = router;
