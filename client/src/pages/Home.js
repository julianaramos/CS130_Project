import React from 'react'
//import { useDispatch, useSelector } from 'react-redux';
//import { Link } from 'react-router-dom';
//import { login, logout } from '../redux/user';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Masonry from '@mui/lab/Masonry';
import { useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
//import { useTheme } from '@mui/system'; add custom theme later
import NavBar from './NavBar';
import Diagram_img from '../images/UML-Class-Diagram.png'

const Home = () => {
    /*const { uid } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    
    let x = <div> Not Logged In </div>
    if (uid !== null){
        x = <div> Logged In </div>
    }

    function togglelogin() {
        if (uid !== null){
            dispatch(logout());
        }
        else{
            dispatch(login("test"));
        }
    }
    */
        /*{x}
    <button onClick={togglelogin}>togglelogin</button>
    <Link to = "/login"> To Login </Link>
    */
    const isSmallScreen = useMediaQuery('(max-width:600px)');
    const columns = isSmallScreen ? 1 : 3;

    const userUML = [
        {
            username: "Logan",
            Dname: "starbucks app",
            description: "a simplified design of the starbucks app. sljfhbgdkhfbg dlfbakjerng;dfjdka; fjbgka kjnfgkelabgkdhfngvkaber kj bkdbgkdfn  ekrhg ksjnfe hr kfnk rkhbfkvd fgk kd fv rkndfkjbvkdj gea kdnf kadjnrg fkj aekrjndkf v ekvj dfvk dgefkj d",
            diagram: Diagram_img 
        },
        {
            username: "Ray",
            Dname: "tiktok app",
            description: "a simplified design of the tiktok app. sljfhbgdkhfbg dlfbakjerng;dfjdka; fjbgka kjnfgkelabgkdhfngvkaber kj bkdbgkdfn  ekrhg ksjnfe hr kfnk rkhbfkvd fgk kd fv rkndfkjbvkdj gea kdnf kadjnrg fkj aekrjndkf v ekvj dfvk dgefkj d",
            diagram: Diagram_img       
        },
        {
            username: "Roberto",
            Dname: "Panera app",
            description: "a simplified design of the panera app. sljfhbgdkhfbg dlfbakjerng;dfjdka; fjbgka kjnfgkelabgkdhfngvkaber kj bkdbgkdfn  ekrhg ksjnfe hr kfnk rkhbfkvd fgk kd fv rkndfkjbvkdj gea kdnf kadjnrg fkj aekrjndkf v ekvj dfvk dgefkj d",
            diagram: Diagram_img      
        },
        {
            username: "Panaberta",
            Dname: "AMC app",
            description: "a simplified design of the AMC app. sljfhbgdkhfbg dlfbakjerng;dfjdka; fjbgka kjnfgkelabgkdhfngvkaber kj bkdbgkdfn  ekrhg ksjnfe hr kfnk rkhbfkvd fgk kd fv rkndfkjbvkdj gea kdnf kadjnrg fkj aekrjndkf v ekvj dfvk dgefkj d",
            diagram: Diagram_img 
        },
        {
            username: "Logan",
            Dname: "starbucks app",
            description: "a simplified design of the starbucks app. sljfhbgdkhfbg dlfbakjerng;dfjdka; fjbgka kjnfgkelabgkdhfngvkaber kj bkdbgkdfn  ekrhg ksjnfe hr kfnk rkhbfkvd fgk kd fv rkndfkjbvkdj gea kdnf kadjnrg fkj aekrjndkf v ekvj dfvk dgefkj d",
            diagram: Diagram_img 
        },
        {
            username: "Ray",
            Dname: "tiktok app",
            description: "a simplified design of the tiktok app. sljfhbgdkhfbg dlfbakjerng;dfjdka; fjbgka kjnfgkelabgkdhfngvkaber kj bkdbgkdfn  ekrhg ksjnfe hr kfnk rkhbfkvd fgk kd fv rkndfkjbvkdj gea kdnf kadjnrg fkj aekrjndkf v ekvj dfvk dgefkj d",
            diagram: Diagram_img 
        },
        {
            username: "Roberto",
            Dname: "Panera app",
            description: "a simplified design of the panera app. sljfhbgdkhfbg dlfbakjerng;dfjdka; fjbgka kjnfgkelabgkdhfngvkaber kj bkdbgkdfn  ekrhg ksjnfe hr kfnk rkhbfkvd fgk kd fv rkndfkjbvkdj gea kdnf kadjnrg fkj aekrjndkf v ekvj dfvk dgefkj d",
            diagram: Diagram_img 
        },
        {
            username: "Panaberta",
            Dname: "AMC app",
            description: "a simplified design of the AMC app. sljfhbgdkhfbg dlfbakjerng;dfjdka; fjbgka kjnfgkelabgkdhfngvkaber kj bkdbgkdfn  ekrhg ksjnfe hr kfnk rkhbfkvd fgk kd fv rkndfkjbvkdj gea kdnf kadjnrg fkj aekrjndkf v ekvj dfvk dgefkj d",
            diagram: Diagram_img 
        },
    ]

    return (
        <div>
            <NavBar/>
            <Container
                id="user-designs"
                sx={{
                    pt: { xs: 4, sm: 12 },
                    pb: { xs: 8, sm: 16 },
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: { xs: 3, sm: 6 },
                }}
                >
                <Box
                    sx={{
                    width: { sm: '100%', md: '60%' },
                    textAlign: { sm: 'left', md: 'center' },
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
                        size="small"
                        variant="outlined"
                        placeholder= "unload your ideas..."
                    />
                </Box>
                <Box
                    sx={{
                    width: { sm: '100%', md: '60%' },
                    textAlign: { sm: 'left', md: 'center' },
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
                <Masonry columns={columns} spacing={2}>
                    {userUML.map((UML, index) => (
                    <Card key={index} sx={{ p: 1 }}>
                        <CardMedia 
                            sx={{ height: 150 }}
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
                                uname={UML.username}
                                title={UML.Dname}
                                subheader={UML.description}
                            />
                        </Box>
                    </Card>
                    ))}
                </Masonry>
            </Container>
        </div>
    );
}

export default Home;
