import React from 'react';
import AppBar from '@mui/material/AppBar';
import {Box, Container, Toolbar, Tooltip, Menu, MenuItem, Button, Slide} from '@mui/material';
import {IconButton,ListItemIcon} from '@mui/material';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import useScrollTrigger from '@mui/material/useScrollTrigger';

import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../redux/user';
import {setUml, removeUML} from '../redux/uml';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';  

import DashboardIcon from '@mui/icons-material/Dashboard';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import {Settings, Logout} from '@mui/icons-material';

function HideOnScroll(props) {
    const { children} = props;
    const trigger = useScrollTrigger();
  
    return (
      <Slide appear={false} direction="down" in={!trigger}>
        {children}
      </Slide>
    );
}

const UMenu = () => {
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { uid } = useSelector((state) => state.user);

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };
    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    function flogout() {
        dispatch(logout());
    }

    const handleDashboardClick = () => {
        dispatch(removeUML());
        navigate("/dashboard");
    }

    const handleHomeClick = () => {
        dispatch(removeUML());
        navigate("/");
    }

    const handleDeleteClick = async () => {
        const body = {
            uid: uid
        };
        await axios.post('http://localhost:4000/delete-account', body);
        dispatch(logout());
        dispatch(removeUML());
        window.location.href = '/'; //need to refresh page
    }

    return (
        <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open options">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Remy Sharp" src="/broken-image.jpg" />
                </IconButton>
            </Tooltip>
            <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
            >
                
            <MenuItem component="a" onClick={handleDashboardClick}><ListItemIcon ><DashboardIcon/></ListItemIcon>Dashboard </MenuItem>
            <MenuItem component="a" onClick={handleHomeClick}><ListItemIcon><Settings/></ListItemIcon>Settings </MenuItem>
            <MenuItem onClick={flogout}><ListItemIcon><Logout/></ListItemIcon>Logout</MenuItem>
            <MenuItem onClick={handleDeleteClick}><ListItemIcon><DeleteIcon/></ListItemIcon>Delete Account</MenuItem>
            </Menu>
        </Box>
    )
}

const LogMenu = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const handleLoginClick = () => {
        dispatch(removeUML());
        navigate("/login");
    }

    return (
        <Box sx={{ flexGrow: 0 }}>
            <Button
            key="Log in"
            onClick={handleLoginClick}
            sx={{ my: 2, color: 'white', display: 'block', fontWeight:600 }}
            >
            Log In
            </Button>
        </Box>
    )
}

const NavBar = () => {
    const { uid } = useSelector((state) => state.user);
    const pages = [];
    const navigate = useNavigate()
    const dispatch = useDispatch()
    
    const handleHomeClick = () => {
        dispatch(removeUML());
        navigate("/");
    }

    let x = <LogMenu/>
    if (uid !== null){
        x = <UMenu/>
    }

    return (
        <HideOnScroll>
            <AppBar>
                <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Button
                        variant='text'
                        onClick = {handleHomeClick}
                        style={{ color:"white" , fontSize: '1.6rem', fontWeight: 650, letterSpacing:".2rem"}}
                        > <AccountTreeIcon sx={{ mr:"1rem" }} />
                        UML Lab
                    </Button>      
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {pages.map((page) => (
                            <Button
                            sx={{ my: 2, color: 'white', display: 'block', fontWeight:600, mx:"1rem" }}
                            >
                            {page}
                            </Button>
                        ))}
                    </Box>
                    {x}
                </Toolbar>
                </Container>
            </AppBar>
        </HideOnScroll>
    );
}
export default NavBar;