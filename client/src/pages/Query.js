import React, { useEffect, useState } from 'react';
//import Switch from '@mui/material/Switch';
//import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import { TextField, Card, CardMedia, Typography, Stack, IconButton, TextareaAutosize, CardContent } from '@mui/material';
import './Query.css'
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Diagram_img from '../images/test.png'
import NavBar from './NavBar';
import { useDispatch, useSelector } from 'react-redux';
import { setUML } from '../redux/uml';

import LoadingButton from '@mui/lab/LoadingButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Missing from '../images/Not-Found.svg'

const UmlInputBox = ({umlText, handleUMLChange}) => {    
    return (
      <Card className='uml-wrapper'>
        <CardContent>
          <TextareaAutosize
            className='uml-box'
            variant="outlined"
            placeholder="Enter a search term"
            value={umlText}
            rows = {35}
            minRows= {35}
            maxRows= {35}
            onChange={handleUMLChange}
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
      src={image !== '' ? image : Missing}
    />
  </Card>)
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


const Query = () => {
    const {state} = useLocation();

    const [umlText, setUMLText] = useState(state && state.content ? state.content : '')
    const [data, setData] = useState({});
    const [feedback, setFeedback] = useState('');
    const [promptText, setPromptText] = useState(state && state.prompt ? state.prompt : '');
    const [diagram, setDiagram] = useState('');
    const { uid } = useSelector((state) => state.user);
    const {uml_id} = useSelector((state) => state.uml);
    const [descriptionText, setDescriptionText] = useState(state && state.description ? state.description: '');
    const [nameText, setNameText] = useState(state && state.name ? state.name: 'untitled');
    const [privacy, setPrivacy] = useState(state && state.privacy ? state.privacy: 'public');
    const [diagramLoaded, setDiagramLoaded] = useState(false);
    const [promptLoaded, setPromptLoaded] = useState(true);
    const [assistLoaded, setAssistLoaded] = useState(true);
    const dispatch = useDispatch();
    const [prompttoggle, setPromptToggle] = useState(state && state.prompttoggle ? state.prompttoggle: 'prompt');
    const [oneTimeLoad, setOneTimeLoad] = useState(state && state.oneTimeLoad ? state.oneTimeLoad : false)

    const handleUMLChange = (event) => {
        setUMLText(event.target.value);
        setDiagramLoaded(false);
    };

    const handleSubmission = async () => {
        const body = {
          uml_code: umlText,
          prompt: promptText,
          query: promptText
        }

        if (prompttoggle == 'prompt'){
          setPromptLoaded(false);
          const res = await axios.post('http://localhost:4000/query-assistant-code-generator', body);
          console.log('done');
          if (res.status == 200){
            setUMLText(res.data.uml_code);
            setPromptLoaded(true);
            setDiagramLoaded(false);
          }
        }
        else{
          setAssistLoaded(false);
          const res = await axios.post('http://localhost:4000/query-assistant-code-examiner', body);
          if (res.status == 200){
            setAssistLoaded(true);
            console.log(res.data);
            setFeedback(res.data);
          }
        }
    };

    const handlePromptChange = (event) => {
      setPromptText(event.target.value);
    }

    const handlePromptClick = (event, newPrompt) => {
      if (newPrompt !== null) {
          setPromptToggle(newPrompt);
      }
  };

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
        if (res.status == 200){
          setDiagram(res.data);
          setDiagramLoaded(true);
        }
        console.log(res);
      }
      catch(error){

      }
    }

    useEffect(() => {
        if (umlText != '' && !diagramLoaded)
          loadDiagram();
        if (oneTimeLoad && promptText != ''){
          console.log('here');
          handleSubmission();
        }
        setOneTimeLoad(false);
    });

    return (
    <div>
      <NavBar IndependentPageButtons={"QueryPage"} umlText={umlText} diagram={diagram}/>
      <Grid container direction='row' className='query-container' spacing={2}>
          <Grid item className='uml-wrapper' xs = {6}>
              <UmlInputBox handleUMLChange={handleUMLChange} umlText={umlText} className='uml-box'/>
          </Grid>
          <Grid item className='diagram-wrapper' xs = {6}>
            <Diagram image={diagram}/>
          </Grid>
      </Grid>
      <Grid container direction='row' spacing={2} >
        <Grid item xs={10} mt={2}>
          <Prompt handlePromptChange={handlePromptChange} promptText={promptText} />
        </Grid>
        <Grid item xs={2} >
          <Grid container item direction='column' rowSpacing={1}>
            <Grid item >
            <ToggleButtonGroup
                value={prompttoggle}
                exclusive
                onChange={handlePromptClick}
                aria-label="UML Privacy"
                >
                <ToggleButton value="prompt" aria-label="Prompt">
                    Prompt
                </ToggleButton>
                <ToggleButton value="query" aria-label="Query">
                    Query
                </ToggleButton>
            </ToggleButtonGroup>
            </Grid>
            <Grid item >
            <LoadingButton
                onClick={handleSubmission}
                loading={(!assistLoaded || !promptLoaded)}
                loadingPosition="start"
                variant="contained"
                >
                <span>Submit</span>
            </LoadingButton>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>

    );
};

export default Query;
