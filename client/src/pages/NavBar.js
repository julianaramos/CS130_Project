import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Slide from '@mui/material/Slide';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../redux/user';

import DashboardIcon from '@mui/icons-material/Dashboard';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import ListItemIcon from '@mui/material/ListItemIcon';


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
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };
    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const dispatch = useDispatch();
    function flogout() {
        dispatch(logout());
    }
    return (
        <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
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
                
            <MenuItem component="a" href="/dashboard"><ListItemIcon ><DashboardIcon/></ListItemIcon>Dashboard </MenuItem>
            <MenuItem component="a" href='/'><ListItemIcon><Settings/></ListItemIcon>Settings </MenuItem>
            <MenuItem onClick={flogout}><ListItemIcon><Logout/></ListItemIcon>Logout</MenuItem>
            </Menu>
        </Box>
    )
}

const LogMenu = () => {
    return (
        <Box sx={{ flexGrow: 0 }}>
            <Button
            key="Log in"
            href='/login'
            sx={{ my: 2, color: 'white', display: 'block', fontWeight:600 }}
            >
            Log In
            </Button>
        </Box>
    )
}

const NavBar = () => {
    const { uid } = useSelector((state) => state.user);
    const pages = ['Something', "Something else"];

    let x = <LogMenu/>
    if (uid !== null){
        x = <UMenu/>
    }

    return (
        <HideOnScroll>
            <AppBar>
                <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <AccountTreeIcon sx={{ display: { xs: 'none', md: 'flex' }, mr:"1rem" }} />
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 8,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.2rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                        >
                        UML Lab
                    </Typography>      
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