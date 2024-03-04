import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { login, logout } from '../redux/user';
import {TextField} from "@mui/material"
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import NavBar from './NavBar';
import axios from 'axios';
import firebase from '../firebase';

const Login = () => {
    const { uid } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    
    const [email,setEmail] = useState('');
    const [password,SetPassword] =useState('')
    const [errorMessage, setErrorMessage] = useState('');
    const [emailerror,setEmailerror] = useState(false);
    const [passworderror,SetPassworderror] =useState(false)
    const [emailerrorMsg,setEmailerrorMsg] = useState('');
    const [passworderrorMsg,SetPassworderrorMsg] =useState('')
    const body = {email: email, password:password }
    const navigate = useNavigate()

    const handleValidation = () =>{
        setEmailerror(false);
        SetPassworderror(false);
        const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(email===''){
            setEmailerror(true);
            setEmailerrorMsg('Please enter an email');
        }
        else if(!emailRegEx.test(email)){
            setEmailerror(true);
            setEmailerrorMsg('Invalid email address');
        }
        if(password===''){
            SetPassworderror(true);
            SetPassworderrorMsg('Please enter a password');
        }
        else if(password.length < 6){
            SetPassworderror(true);
            SetPassworderrorMsg('Invalid password');
        }
    }
    const handleLogIn = async () => {
        handleValidation();
        try {
            console.log('loading')
            const res = await axios.post('http://localhost:4000/login', body);
            // If the request is successful (status code 2xx)
            if(res.status === 200){
                dispatch(login(res.data.user.uid))
                navigate("/");
            }
        } catch (error) {
            // If the request encounters an error (status code outside 2xx range)
            console.error('Error:', error.message,'with',error);
            setEmailerror(true);
            setEmailerrorMsg('Invalid email address or password');
            SetPassworderror(true);
            SetPassworderrorMsg('Invalid email address or password');
        }
    }

    const handleGoogleLogIn = async () => {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await firebase.auth().signInWithPopup(provider);
            const user = result.user;
            const userId = user.uid;
            // Check if user exists in your database
            const res = await axios.post('http://localhost:4000/google-login', { user: user, uid: userId });
            if (res.status === 200) {
                dispatch(login(userId));
                navigate('/');
            }
            console.log('Response data:', res);
        } catch (error) {
            if (error.response && error.response.status === 404 && error.response.data === "User does not exist") {
                await firebase.auth().currentUser.delete();
                setErrorMessage('User does not exist. Please sign up instead.');
            } else {
                setErrorMessage('An error occurred. Please try again.');
            }
        }
    };

    // let x = <div> Not Logged In </div>
    // if (uid !== null){
    //     x = <div> Logged In </div>
    // }

    // function togglelogin() {
    //     if (uid !== null){
    //         dispatch(logout());
    //     }
    //     else{
    //         dispatch(login("test"));
    //     }
    // }

    return (
        // <div>
        //     <form noValidate autoComplete="off">
        //         <TextField id="standard-basic" label="Standard" />
        //         <TextField id="filled-basic" label="Filled" variant="filled" />
        //         <TextField id="outlined-basic" label="Outlined" variant="outlined" />
        //     </form>
        //     {x}
        //     <button onClick={togglelogin}>togglelogin</button>
        //     <Link to = "/signup"> To Signup </Link>
        // </div>
        <div> 
            <NavBar/>  
            <Container component="main" maxWidth="xs">
                    <Box
                    sx={{
                        marginTop: 15,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'primary.main' , width: 48, height: 48 }}>
                            <AccountTreeIcon />
                        </Avatar>
                        <Typography component="h1" variant="h4" sx = {{marginTop: 3}}>
                            Sign in
                        </Typography>
                            <Box component="form"  noValidate sx={{ mt: 5 }}>
                                <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value = {email}
                                onChange = {(e) => setEmail(e.target.value)}
                                error={emailerror}
                                helperText={emailerrorMsg}
                                />
                                <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value = {password}
                                onChange = {(e) => SetPassword(e.target.value)}
                                error={passworderror}
                                helperText={passworderrorMsg}
                                // onKeyDown={(e) => {
                                //     if (e.key === 'Enter') {
                                //       e.preventDefault();
                                //       handleLogIn();
                                //     }
                                //   }}
                                />
                                <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 5, mb: 2 }}
                                onClick={handleLogIn}
                                >
                                Sign In
                                </Button>
                                <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                sx={{mt: 5, mb: 2}}
                                onClick={handleGoogleLogIn}
                                >
                                Sign In with Google
                                </Button>
                                <p style={{color: 'red'}}>{errorMessage}</p>
                                <Grid container>
                                <Grid item>
                                    <Link to ="/signup" variant="body2">
                                    {"Don't have an account? Sign Up"}
                                    </Link>
                                </Grid>
                                </Grid>
                            </Box>
                    </Box>
        </Container>
        </div>
        
    );
}

export default Login;
