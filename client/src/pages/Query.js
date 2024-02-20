import React, { useEffect, useState } from 'react';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import { TextField, Card, CardMedia, Typography, Stack, IconButton } from '@mui/material';
import './Query.css'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const ToggleSwitch = ({assistant, handleAssistantChange}) => {  
    return (
      <div className="button-wrapper">
        <button
          className={`button generate ${assistant === 'Generate' ? 'selected' : ''}`}
          onClick={handleAssistantChange}
          type="button"
        >
          Generate
        </button>
        <button
          className={`button assist ${assistant === 'Assist' ? 'selected' : ''}`}
          onClick={handleAssistantChange}
          type="button"
        >
          Assist
        </button>
      </div>
    );
};

const UmlInputBox = ({umlText, handleUMLChange}) => {

  const handleKeyPress = async(event) => {
    if (event.key === 'Enter') {
      console.log('Enter Pressed');
    }
  }
    
    return (
        <TextField
          id="uml-box"
          label="uml"
          variant="outlined"
          placeholder="Enter a search term"
          value={umlText}
          onChange={handleUMLChange}
          onKeyDown={handleKeyPress}
          multiline
          style={{ width: '100%' }} // Adjust the width as desired
        />
    );
};

const Diagram = ({image}) => {
  return (    
  <Card sx={{ p: 2, width: { xs: '100%', sm: 'auto' }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2 }}>
    <CardMedia
      component="img"
      width="100"
      height="100"
      alt="UML Diagram"
      src={imageUrl}
      sx={{ width: { xs: '100%', sm: 100 }, borderRadius: 0.6 }}
    />
  </Card>)

};

const Query = () => {
    const [umlText, setUMLText] = useState('');
    const [data, setData] = useState('poop');

    const handleUMLChange = (event) => {
        setUMLText(event.target.value);
        // Implement your search logic here (e.g., filter data based on searchText).
    };

    useEffect(() => {
        async function getData() {
            const data = await axios.get('http://localhost:4000/test');
            console.log(data.data);
            setData(data.data);
        }
        getData();
    });

    return (
    <Grid container direction='row' className='query-container'>
        <Grid item className='uml-wrapper'>
            <UmlInputBox handleUMLChange={handleUMLChange} umlText={umlText}/>
        </Grid>
        <Grid item>

        </Grid>
        <div> {umlText} </div>
        <div> {data} </div>
    </Grid>
    );
};


export default Query;
