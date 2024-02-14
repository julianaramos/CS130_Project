import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { login, logout } from '../redux/user';
import {TextField} from "@mui/material"

const Login = () => {
    const { uid } = useSelector((state) => state.user);
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

    return (
        <div>
            <form noValidate autoComplete="off">
                <TextField id="standard-basic" label="Standard" />
                <TextField id="filled-basic" label="Filled" variant="filled" />
                <TextField id="outlined-basic" label="Outlined" variant="outlined" />
            </form>
            {x}
            <button onClick={togglelogin}>togglelogin</button>
            <Link to = "/signup"> To Signup </Link>
        </div>
    );
}

export default Login;
