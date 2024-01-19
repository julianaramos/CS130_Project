import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { login, logout } from '../redux/user';

const Home = () => {
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
            {x}
            <button onClick={togglelogin}>togglelogin</button>
            <Link to = "/login"> To Login </Link>
        </div>
    );
}

export default Home;
