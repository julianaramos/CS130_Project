
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUML, removeUML } from '../redux/uml';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Masonry from '@mui/lab/Masonry';
import { Accordion, AccordionSummary, AccordionDetails, Checkbox, Grid, ButtonBase, CardActionArea, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
//import { useTheme } from '@mui/system'; add custom theme later
import './Query.css'
import NavBar from './NavBar';
import Diagram_img from '../images/UML-Class-Diagram.png'
import axios from 'axios';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const UserDesignContext = createContext();

const Home = () => {
  const [stateChecked, setStateChecked] = useState(true);
  const [classChecked, setClassChecked] = useState(true);
  const [activityChecked, setActivityChecked] = useState(true);
  const [useCaseChecked, setUseCaseChecked] = useState(true);
  const [nameContains, setNameContains] = useState('');
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const [loaded, setLoaded] = useState(false)
  const [userUML, setUserUML] = useState([]);

  async function loadUML() {
    setLoaded(false);
    const body = {
        s: stateChecked,
        c: classChecked,
        a: activityChecked,
        u: useCaseChecked,
        nameContains: nameContains
    }
    try {
      const res = await axios.post('http://localhost:4000/get-all-uml', body);
      console.log(res);
      if (res.status == 200){
        setUserUML(res.data);
        setLoaded(true);
      }
    }
    catch(error)
    {console.log(error);}
    }

    useEffect(() => {
        if (!loaded){
            console.log('loading');
            loadUML();
            console.log('done');
            console.log(userUML);
        }
    });

    return (
        <UserDesignContext.Provider
            value= {{
                stateChecked, setStateChecked, classChecked, setClassChecked, activityChecked, setActivityChecked, useCaseChecked, setUseCaseChecked, nameContains, setNameContains, loadUML, userUML, isSmallScreen, loaded
            }}>
            <Container
                id="user-designs"
                sx={{
                    pt: "5rem",
                    pb: "5rem",
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: { xs: 3, sm: 6 },
                }}
                >
                <PromptBar/>
                <GenText/>
                <Filter/>
                <UserGenerations/>
            </Container>
        </UserDesignContext.Provider>
    );
}

const Filter = () => {
  const { stateChecked, setStateChecked, classChecked, setClassChecked, activityChecked, setActivityChecked, useCaseChecked, setUseCaseChecked, nameContains, setNameContains, loadUML } = useContext(UserDesignContext);

  const handleFormSubmit = () => {
    loadUML();
    console.log('submit');
  }


  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        Filter
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Checkbox checked={stateChecked} onChange={() => setStateChecked(!stateChecked)} />
            State
          </Grid>
          <Grid item xs={12}>
            <Checkbox checked={classChecked} onChange={() => setClassChecked(!classChecked)} />
            Class
          </Grid>
          <Grid item xs={12}>
            <Checkbox checked={activityChecked} onChange={() => setActivityChecked(!activityChecked)} />
            Activity
          </Grid>
          <Grid item xs={12}>
            <Checkbox checked={useCaseChecked} onChange={() => setUseCaseChecked(!useCaseChecked)} />
            Use Case
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Name Contains"
              value={nameContains}
              onChange={(e) => setNameContains(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <button variant="contained" color="primary" onClick={handleFormSubmit}>
                Apply
            </button>
      </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

const PromptBar = () => {
    const [prompt, setPrompt] = useState('');
    const navigate = useNavigate()

    return(
        <Box
        sx={{
        width: .7,
        textAlign: 'center',
        p: "5rem",
        }}
    >
        <Typography component="h1" variant="h3" color="text.primary" marginBottom="1rem">
        UML Lab
        </Typography>
        <TextField
            margin="dense" 
            id="placeholder"
            hiddenLabel
            fullWidth
            multiline
            size="small"
            variant="outlined"
            label= "unload your ideas..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault(); // Prevent the default behavior (inserting a newline)
                  navigate("/query", {state: {prompt: prompt}});
                }
              }}
        />
    </Box>
    );
}

const GenText =() => {
    return (
        <Box
        sx={{
        textAlign: 'center',
        my:"1.5rem",
        }}
    >
        <Typography component="h4" variant="h4" color="text.primary">
            User's UML Generations
        </Typography>
        <Typography variant="body2" color="text.secondary"  my=".5rem">
            Discover what others have created and unlock your potential
        </Typography>
    </Box>
    );
}

const UserGenerations = () => {
    const { userUML, loaded } = useContext(UserDesignContext);
    const isSmallScreen = useMediaQuery('(max-width:600px)');

    const navigate = useNavigate()
    const dispatch = useDispatch();


    const handleCardClick = (event, UML) => {
        console.log(UML);
        navigate("/query", {state: UML});
    }
    const columns = isSmallScreen ? 1 : 3;

    if (!loaded){
        return (<div class="loader"></div>)
    }

    return(
        <Masonry columns={columns} spacing={2}>
            {userUML.map((UML, index) => (
            <Card key={index} sx={{ p: 1 }}>
                <CardActionArea
                    onClick={event => handleCardClick(event, UML)}>
                    <CardMedia 
                        sx={{ height: 300, width: '100%'}}
                        image={UML.diagram}
                        title='UML Diagram' 
                    /> 
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            pr: 2,
                        }}
                    >
                        <CardHeader
                            title={UML.name}
                            subheader={UML.description}
                        />
                    </Box>
                </CardActionArea>
            </Card>
            ))}
        </Masonry>
    );

}

export default Home;
