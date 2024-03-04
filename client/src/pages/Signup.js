import React , {useState}from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { login, logout } from '../redux/user';
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
import TextField from '@mui/material/TextField';
import NavBar from './NavBar'
import axios from 'axios';
import firebase from '../firebase';


const Signup = () => {
    const { uid } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const [email,setEmail] = useState('');
    const [password,SetPassword] =useState('')
    const [conPassword,SetConPassword] =useState('')
    const [errorMessage, setErrorMessage] = useState('');
    const [emailerror,setEmailerror] = useState(false);
    const [passworderror,SetPassworderror] =useState(false)
    const [conPassworderror,SetConPassworderror] =useState(false)
    const [emailerrorMsg,setEmailerrorMsg] = useState('');
    const [passworderrorMsg,SetPassworderrorMsg] =useState('')
    const [conPassworderrorMsg,SetConPassworderrorMsg] =useState('')
    const body = {email: email, password:password ,confirmPassword:conPassword}
    const navigate = useNavigate()

    const handleValidation = () =>{
        setEmailerror(false);
        SetPassworderror(false);
        SetConPassworderror(false);
        setEmailerrorMsg('');
        SetPassworderrorMsg('');
        SetConPassworderrorMsg('');
        var valid = true;
        if(password===''){
            SetPassworderror(true);
            SetPassworderrorMsg('Please enter a password');
            valid = false;
        }
        if(conPassword===''){
            SetConPassworderror(true);
            SetConPassworderrorMsg('Please confirm your password');
            valid = false;
        }
        const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegEx.test(email)){
            setEmailerror(true);
            setEmailerrorMsg('Invalid email address');
            valid = false;
        }
        if(password.length < 6){
            SetPassworderror(true);
            SetPassworderrorMsg('Password must be at least 6 characters');
            valid = false;
        }
        if(conPassword!==password){
            SetConPassworderror(true);
            SetConPassworderrorMsg('Confirm password does not match your password')
            valid = false;
        }

        return valid;
    }
    const handleSignup = async () => {
        if (!handleValidation()){
            return;
        }
        try {
            console.log('loading')
            const res = await axios.post('http://localhost:4000/signup', body);
            if(res.status === 200){
                dispatch(login(res.data.user.uid))
                navigate("/");
            }
            // If the request is successful (status code 2xx)
            console.log('Response data:', res);
        } catch (error) {
            // If the request encounters an error (status code outside 2xx range)
            console.error('Error:', error.message,'with',error.response.data.message);
            if(error.response.data.message){
                setEmailerror(true);
                setEmailerrorMsg(error.response.data.message);
            }
        }
    }

    const handleGoogleSignup = async () => {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await firebase.auth().signInWithPopup(provider);
            const user = result.user;
            const userId = user.uid;

            const res = await axios.post('http://localhost:4000/google-signup', { uid: userId, email: user.email });
            if (res.status === 200) {
                dispatch(login(userId));
                navigate('/');
            }
            console.log('Response data:', res);
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data === "User already exists.") {
                setErrorMessage('User already exists. Please sign in instead.');
            } else {
                setErrorMessage('An error occurred. Please try again.');
            }
        }
    }

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

    return (
        // <div>
        //     {x}
        //     <button onClick={togglelogin}>togglelogin</button>
        //     <Link to = "/login"> To login </Link>
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
                <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 48, height: 48  }}>
                    <AccountTreeIcon />
                </Avatar>
                <Typography component="h1" variant="h4" sx ={{mt: 3}}>
                    Sign up
                </Typography>
                <Box component="form" noValidate  sx={{ mt: 5 }}>
                    <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                        inputProps={{ "data-testid": "email-box" }}
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        value = {email}
                        onChange = {(e) => setEmail(e.target.value)}
                        error={emailerror}
                        helperText={emailerrorMsg}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                        inputProps={{ "data-testid": "password-box" }}
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        value = {password}
                        onChange = {(e) => SetPassword(e.target.value)}
                        error={passworderror}
                        helperText={passworderrorMsg}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                        inputProps={{ "data-testid": "cpassword-box" }}
                        required
                        fullWidth
                        name="confirmpassword"
                        label="Confirm Password"
                        type="password"
                        id="confirmpassword"
                        autoComplete="new-password"
                        value = {conPassword}
                        onChange = {(e) => SetConPassword(e.target.value)}
                        error={conPassworderror}
                        helperText={conPassworderrorMsg}
                        />
                    </Grid>
                    </Grid>
                    <Button
                    type="button"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 5, mb: 2 }}
                    onClick={handleSignup}
                    >
                    Sign Up
                    </Button>
                    <Button
                        type="button"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 1, mb: 2 }}
                        onClick={handleGoogleSignup}
                    >
                        Sign Up with Google
                    </Button>
                    <p style={{ color: 'red' }}>{errorMessage}</p>
                    <Grid container justifyContent="flex-end">
                    <Grid item>
                        <Link to ="/login" variant="body2">
                        Already have an account? Sign in
                        </Link>
                    </Grid>
                    </Grid>
                </Box>
                </Box>
                {/* <Copyright sx={{ mt: 5 }} /> */}
            </Container>
        </div>
    );
}

export default Signup;
