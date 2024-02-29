import React, { useEffect, useState } from 'react';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import { TextField, Card, CardMedia, Typography, Stack, IconButton, TextareaAutosize, CardContent } from '@mui/material';
import './Query.css'
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Diagram_img from '../images/test.png'
import NavBar from './NavBar';
import { useDispatch, useSelector } from 'react-redux';
import { setUML } from '../redux/uml';

const UmlInputBox = ({umlText, handleUMLChange}) => {    
    return (
      <Card className='uml-wrapper'>
        <CardContent>
          <TextareaAutosize
            className='uml-box'
            variant="outlined"
            placeholder="Enter a search term"
            value={umlText}
            rows = {23}
            maxRows= {23}
            onChange={handleUMLChange}
            style={{ width: '100%', height: '72vh'}} // Adjust the width as desired
          />
        </CardContent>
      </Card>
    );
};

const Diagram = ({image}) => {
  return (    
  <Card className='diagram-card'>
    <CardMedia
      sx={{ height: '78vh', width: '50vw', objectFit: "contain"}}
      component="img"
      alt="UML Diagram"
      src={image}
      scale='86%'
    />
  </Card>)
};

const Submit = ({handleSubmission}) => {
  return (<button onClick={handleSubmission}> submit </button>)
};

const Save = ({handleSave}) => {
  return (<button onClick={handleSave}> save </button>)
};

const Prompt = ({handlePromptChange, promptText}) => {
  return (
    <TextField 
      onChange={handlePromptChange}
      value={promptText}
      fullWidth
      label="Prompt"
    />
  )
}

const Description = ({handleDescriptionChange, descriptionText}) => {
  return (
  <TextField 
    onChange={handleDescriptionChange}
    value={descriptionText}
    label="Description"
    fullWidth
  />
  )
}

const Name = ({handleNameChange, nameText}) => {
  return (
    <TextField 
      onChange={handleNameChange}
      value={nameText}
      label="Name"
      fullWidth
    />
    )
}

const Privacy = ({handlePrivacyChange, privacy}) => {
  return (
    <div>
        <button onClick={handlePrivacyChange}> {privacy} </button>
    </div>
    )
}

const SaveWork = ({handleSave, handleDescriptionChange, descriptionText, handleNameChange, nameText, handlePrivacyChange, privacy}) => {
  const { uid } = useSelector((state) => state.user);
  if (uid !== null)
  {
    return (
    <div>
      <div> Save your work! </div>
      <Name handleNameChange={handleNameChange} nameText={nameText} />
      <Description handleDescriptionChange={handleDescriptionChange} descriptionText={descriptionText} />
      <Privacy handlePrivacyChange={handlePrivacyChange} privacy={privacy} />
      <Save handleSave={handleSave} />
    </div>
    )
  }
  else{
    return <div> Login to save your work! </div>;
  }
}

const Query = () => {
    const {state} = useLocation();

    const [umlText, setUMLText] = useState(state ? state.content : '')
    const [data, setData] = useState({});
    const [feedback, setFeedback] = useState('');
    const [promptText, setPromptText] = useState('');
    const [diagram, setDiagram] = useState('');
    const { uid } = useSelector((state) => state.user);
    const {uml_id} = useSelector((state) => state.uml);
    const [descriptionText, setDescriptionText] = useState(state ? state.description: '');
    const [nameText, setNameText] = useState(state ? state.name: 'untitled');
    const [privacy, setPrivacy] = useState(state ? state.privacy: 'public');
    const [loaded, setLoaded] = useState(false);
    const dispatch = useDispatch();

    const handleUMLChange = (event) => {
        setUMLText(event.target.value);
        loadDiagram();
    };

    const handleSubmission = async () => {
        const body = {
          uml_code: umlText,
          prompt: promptText
        }
        console.log('loading');
        const res = await axios.post('http://localhost:4000/query-assistant-code-generator', body);
        console.log('done');
        setUMLText(res.data.uml_code);
        setLoaded(false);
        console.log(res);
    };

    const handlePromptChange = (event) => {
      setPromptText(event.target.value);
    }

    const handleDescriptionChange = (event) => {
      setDescriptionText(event.target.value);
    }

    const handleNameChange = (event) => {
      setNameText(event.target.value);
    }

    const handlePrivacyChange = (event) => {
      if (privacy == 'public') {
        setPrivacy('private');
      }
      else {
        setPrivacy('public');
      }
    }

    const handleSave = async () => {
      const body = {
        uml_id : uml_id,
        uid: uid,
        content: umlText,
        privacy: privacy,
        name: nameText,
        description: descriptionText,
        diagram: diagram,
      }
      if (uid != null && uml_id == null) { // if we are logged in but this is a new diagram
        try {
          console.log(body);
          const res = await axios.post('http://localhost:4000/create-new-uml', body);
          dispatch(setUML(res.data));
          console.log(res);
        }
        catch(error)
        {}
      }
      else if(uml_id != null) // if we know what uml we are changing
      {
        try{
          console.log(body);
          const res = await axios.post('http://localhost:4000/update-uml', body);
          console.log(res);
        }
        catch(error){}
      }
    }

    async function loadDiagram() {
      const scaleBody = {
        uml_code: umlText,
        scale_width: 1000,
        scale_height: 1000
      }
      try {
        //const res1 = await axios.post('http://localhost:4000/add-scale-to-uml', scaleBody);
        //const uml_code_scaled = res1.data;
        //console.log(res1);

        //console.log(uml_code_scaled);
        
        const plantBody = {
          uml_code: umlText, //not using scaled for now
          response_type: 'SVG',
          return_as_uri: true

        }
        const res = await axios.post('http://localhost:4000/fetch-plant-uml', plantBody);
        setDiagram(res.data);
        console.log(res);
      }
      catch(error){

      }
    }

    useEffect(() => {
        if (umlText != '' && !loaded)
          loadDiagram();
          setLoaded(true);
    });

    return (
    <div>
      <NavBar IndependentPageButtons={"QueryPage"}/>
      <Grid container direction='row' className='query-container' spacing={2}>
          <Grid item className='uml-wrapper' xs = {6}>
              <UmlInputBox handleUMLChange={handleUMLChange} umlText={umlText} className='uml-box'/>
          </Grid>
          <Grid item className='diagram-wrapper' xs = {6}>
            <Diagram image={diagram}/>
          </Grid>
      </Grid>
      <Prompt handlePromptChange={handlePromptChange} promptText={promptText} />
      <Submit handleSubmission={handleSubmission}/>
    </div>

    );
};
//      <SaveWork handleSave={handleSave} handleDescriptionChange={handleDescriptionChange} descriptionText={descriptionText} handleNameChange={handleNameChange} nameText={nameText} handlePrivacyChange={handlePrivacyChange} privacy={privacy}/>


export default Query;
