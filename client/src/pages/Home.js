
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUML, removeUML } from '../redux/uml';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Masonry from '@mui/lab/Masonry';
import { ButtonBase, CardActionArea, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
//import { useTheme } from '@mui/system'; add custom theme later
import './Query.css'
import NavBar from './NavBar';
import Diagram_img from '../images/UML-Class-Diagram.png'
import axios from 'axios';
import { Link, Navigate, useNavigate } from 'react-router-dom';

const Home = () => {
    return (
        <div>
            <NavBar/>
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
                <UserGenerations/>
            </Container>
        </div>
    );
}

const PromptBar = () => {
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
    const isSmallScreen = useMediaQuery('(max-width:600px)');

    var [loaded, setLoaded] = useState(false)
    const [userUML, setUserUML] = useState([]);
    const navigate = useNavigate()
    const dispatch = useDispatch();


    useEffect(() => {
        async function loadUML() {
            const body = {}
            try {
              const res = await axios.post('http://localhost:4000/get-all-uml', body);
              if (res.status == 200){
                setUserUML(res.data);
                setLoaded(true);
              }
            }
            catch(error)
            {console.log(error);}
        }

        if (!loaded){
            console.log('loading');
            loadUML();
            console.log('done');
            console.log(userUML);
        }
    });

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
                        sx={{ height: 300, width: '100%', objectFit: "contain"}}
                        component="img"
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
