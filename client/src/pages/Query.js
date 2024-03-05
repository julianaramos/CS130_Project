import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { TextField, Card, CardMedia, TextareaAutosize, CardContent } from '@mui/material';
import './Query.css'
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import NavBar from './NavBar';
import { useSelector } from 'react-redux';
import LoadingButton from '@mui/lab/LoadingButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Missing from '../images/Missing.svg';
import SubmitIcon from '@mui/icons-material/ArrowUpward';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const UmlInputBox = ({umlText, handleUMLChange}) => {    
    return (
      <Card className='uml-wrapper'>
        <CardContent>
          <TextareaAutosize
            className='uml-box'
            variant="outlined"
            placeholder="Enter a search term"
            value={umlText}
            rows = {33}
            minRows= {33}
            maxRows= {33}
            onChange={handleUMLChange}
            data-testid = 'uml-box'
          />
        </CardContent>
      </Card>
    );
};

const Diagram = ({image}) => {
  return (    
    <Card className='diagram-card'>
      <CardMedia
        sx={{ height: '78vh', width: '50vw', objectFit: "contain" }}
        component="img"
        alt="UML Diagram"
        src={image}
      />
    </Card>
  );
};

const Prompt = ({handlePromptChange, promptText}) => {
  return (
    <TextField 
      onChange={handlePromptChange}
      value={promptText}
      fullWidth
      label="Your Prompt"
    />
  );
};

const Query = () => {
  const {state} = useLocation();

  const [umlText, setUMLText] = useState(state && state.content ? state.content : '');
  const [promptText, setPromptText] = useState(state && state.prompt ? state.prompt : '');
  const [diagram, setDiagram] = useState(Missing);
  const [diagramLoaded, setDiagramLoaded] = useState(false);
  const [generatorResponded, setGeneratorResponded] = useState(true);
  const [examinerResponded, setExaminerResponded] = useState(true);
  const [examinerResponse, setExaminerResponse] = useState('');
  const [prompttoggle, setPromptToggle] = useState(state && state.prompttoggle ? state.prompttoggle: 'prompt');
  const [oneTimeLoad, setOneTimeLoad] = useState(state && state.oneTimeLoad ? state.oneTimeLoad : false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [alertText, setAlertText] = useState('');

  const handleUMLChange = (event) => {
    setUMLText(event.target.value);
    setDiagramLoaded(false);
  };

  const handleSubmission = async () => {
    const body = {
      uml_code: umlText,
      prompt: promptText,
      query: promptText
    };

    if (prompttoggle == 'prompt') {
      setGeneratorResponded(false);
      const res = await axios.post('http://localhost:4000/query-assistant-code-generator', body);
      console.log('done');
      if (res.status == 200) {
        setUMLText(res.data.uml_code);
        setGeneratorResponded(true);
        setDiagramLoaded(false);
      }
    }
    else {
      setExaminerResponded(false);
      const res = await axios.post('http://localhost:4000/query-assistant-code-examiner', body);
      if (res.status == 200) {
        setExaminerResponded(true);
        console.log(res.data);
        setExaminerResponse(res.data);
      }
    }
  };

  const handlePromptChange = (event) => {
    setPromptText(event.target.value);
  };

  const handlePromptClick = (_, newPrompt) => {
    if (newPrompt !== null) {
      setPromptToggle(newPrompt);
    }
  };

  async function loadDiagram() {
    try {
      const plantBody = {
        uml_code: umlText,
        response_type: 'SVG',
        return_as_uri: true
      };
      const res = await axios.post('http://localhost:4000/fetch-plant-uml', plantBody);
      setDiagram(res.data);
      setDiagramLoaded(true);
      setOpenSnackbar(false);
    }
    catch(error) {
      switch (error.response.data.type) {
        case 'InvalidUMLCodeError':
          setAlertText('Invalid UML Code');
          break;
        case 'TimeoutError':
          setAlertText('PlantUML Server Timeout');
          break;
        case 'ServerError':
          setAlertText('PlantUML Server Unavailable');
        default:
          setAlertText('Unknown PlantUML Server Error');
      }
      setOpenSnackbar(true);
    }      
  };

  useEffect(() => {
    if (umlText != '' && !diagramLoaded)
      loadDiagram();
    if (oneTimeLoad && promptText != ''){
      handleSubmission();
    }
    setOneTimeLoad(false);
  });

  return (
    <div>
      <NavBar IndependentPageButtons={"QueryPage"} umlText={umlText} diagram={diagram} />
      <Grid container direction='row' className='query-container' spacing={2}>
        <Grid item className='uml-wrapper' xs = {6}>
          <UmlInputBox handleUMLChange={handleUMLChange} umlText={umlText} className='uml-box' />
        </Grid>
        <Grid item className='diagram-wrapper' xs = {6} sx={{ position: 'relative' }}>
          <Diagram image={diagram} />
          <Snackbar
            open={openSnackbar}
            onClose={() => setOpenSnackbar(false)}
            sx={{ position: 'absolute'}}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert onClose={() => setOpenSnackbar(false)} severity="error" sx={{ width: '100%' }}>
              {alertText}
            </Alert>
          </Snackbar>
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
                loading={(!generatorResponded || !examinerResponded)}
                loadingPosition="start"
                startIcon={<SubmitIcon />}
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