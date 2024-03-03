import React, { useEffect, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import {Box, Container, Toolbar, Tooltip, Menu, MenuItem, Button, Slide} from '@mui/material';
import {IconButton,ListItemIcon} from '@mui/material';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/icons-material/AccountCircle';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import LoadingButton from '@mui/lab/LoadingButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';

import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../redux/user';
import { setUML, removeUML} from '../redux/uml';
import { Navigate, useNavigate, useLocation} from 'react-router-dom';
import axios from 'axios';  

import DashboardIcon from '@mui/icons-material/Dashboard';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SaveIcon from '@mui/icons-material/Save';
import {Settings, Logout} from '@mui/icons-material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EditNoteIcon from '@mui/icons-material/EditNote';

function HideOnScroll(props) {
    const { children} = props;
    const trigger = useScrollTrigger();
  
    return (
      <Slide appear={false} direction="down" in={!trigger}>
        {children}
      </Slide>
    );
}
const UserMenu = () => {
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

    const handleDeleteClick = async () => {
        const body = {
            uid: uid
        };
        await axios.post('http://localhost:4000/delete-account', body);
        dispatch(logout());
        dispatch(removeUML());
        window.location.href = '/'; //need to refresh page
    }
    const handleLoginClick = () => {
        dispatch(removeUML());
        navigate("/login");
    }

    if (uid !== null){
        return (
            <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Open options">
                    <IconButton data-testid = 'usericon' onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                        <Avatar fontSize ="large" sx={{color: '#FFFFFF'}}/>
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
                    
                <MenuItem onClick={handleDashboardClick}><ListItemIcon ><DashboardIcon/></ListItemIcon>Dashboard </MenuItem>
                <MenuItem><ListItemIcon><Settings/></ListItemIcon>Settings </MenuItem>
                <MenuItem onClick={flogout}><ListItemIcon><Logout/></ListItemIcon>Logout</MenuItem>
                <MenuItem onClick={handleDeleteClick}><ListItemIcon><DeleteIcon/></ListItemIcon>Delete Account</MenuItem>
                </Menu>
            </Box>
        )
    }
    else{
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
    
}

const PageButtons = ({IndependentPageButtons=null, umlText=null, diagram=null}) =>{
    const {state} = useLocation();

    //const [umlText, setUMLText] = useState(state ? state.content : '')
    //const [data, setData] = useState({});
    //const [feedback, setFeedback] = useState('');
    //const [promptText, setPromptText] = useState('');
    //const [diagram, setDiagram] = useState('');
    const { uid } = useSelector((state) => state.user);
    const {uml_id} = useSelector((state) => state.uml);
    const [nameText, setNameText] = useState(state && state.name ? state.name: 'untitled');
    const [privacy, setPrivacy] = useState(state && state.privacy ? state.privacy: 'public');
    const [descriptionText, setDescriptionText] = useState(state && state.description ? state.description: '');
    //const [loaded, setLoaded] = useState(false);
    const dispatch = useDispatch();

    const [open, setOpen] = useState(false);    //description dialog button
    const [loadingb, setLoadingb] = useState(false); //save loading button state
  
    const handleNameChange = (event) => {
        setNameText(event.target.value);
    }

    const handleDescriptionChange = (event) => {
        setDescriptionText(event.target.value);
    }
  
    const handleClickDescription = () => {
      setOpen(true);
    };
  
    const handleClose = (event) => {
      setDescriptionText(descriptionText);
      setOpen(false);
    };

    const handlePrivacyClick = (event, newPrivacy) => {
        if (newPrivacy !== null) {
            setPrivacy(newPrivacy);
        }
    };

    const handleSaveClick = async () => {
        console.log("SACING");
        setLoadingb(true);
        const body = {
          uml_id : uml_id,
          uid: uid,
          content: umlText,
          privacy: privacy,
          name: nameText,
          description: descriptionText,
          diagram: diagram,
        }
        if (uid != null && uml_id == null) { // if we are logged in but this is a new diagram
          try {
            console.log(body);
            const res = await axios.post('http://localhost:4000/create-new-uml', body);
            dispatch(setUML(res.data));
            console.log(res);
          }
          catch(error)
          {}
        }
        else if(uml_id != null) // if we know what uml we are changing
        {
          try{
            console.log(body);
            const res = await axios.post('http://localhost:4000/update-uml', body);
            console.log(res);
          }
          catch(error){}
        }
        setLoadingb(false);
    };

    if(IndependentPageButtons==null){
        return(
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}/>
        )
    }
    else if(IndependentPageButtons=="QueryPage"){
        return(
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'flex' ,lg:'flex'} }}>
                <TextField 
                    sx={{ml:"8rem", mr:'5rem', input: {color: 'white'}}}
                    onChange={handleNameChange}
                    placeholder='Untitled'
                    value={nameText}
                    hiddenLabel
                    variant="outlined"
                    color="grey"
                />
                <Button sx={{ mr:'5rem', color:'white', borderColor:'#135ba2', '&:hover': {borderColor: 'black', backgroundColor: '#176cc1'},}} variant="outlined" onClick={handleClickDescription}>
                    <EditNoteIcon/>Description
                </Button>
                <Dialog onClose={handleClose} open={open} 
                    fullWidth         
                    sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    }}>
                    <DialogTitle sx={{ my: "1rem"}}>UML Diagram Description</DialogTitle>
                    <TextField 
                        
                        onChange={handleDescriptionChange}
                        value={descriptionText}
                        label="Description..."
                        multiline
                        
                    />
                </Dialog>
                <ToggleButtonGroup sx={{ ml:'2rem', mr:'5rem'}}
                    value={privacy}
                    exclusive
                    onChange={handlePrivacyClick}
                    aria-label="UML Privacy"
                    >
                    <Tooltip title="Public" arrow><ToggleButton value="public" aria-label="Public">
                        <VisibilityIcon />
                    </ToggleButton></Tooltip>
                    <Tooltip title="Private" arrow><ToggleButton value="private" aria-label="Private">
                        <VisibilityOffIcon />
                    </ToggleButton></Tooltip>
                </ToggleButtonGroup>
                <LoadingButton
                    sx={{ mx:'4rem'}}
                    onClick={handleSaveClick}
                    loading={loadingb}
                    loadingPosition="start"
                    startIcon={<SaveIcon />}
                    variant="contained"
                    >
                    <span>Save</span>
                </LoadingButton>
            </Box>
        )
    }
}

const NavBar = ({IndependentPageButtons=null ,umlText=null, diagram=null}) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    
    const handleHomeClick = () => {
        dispatch(removeUML());
        navigate("/");
    };

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
                    <PageButtons IndependentPageButtons={IndependentPageButtons} umlText={umlText} diagram={diagram}/>
                    <UserMenu/>
                </Toolbar>
                </Container>
            </AppBar>
        </HideOnScroll>
    );
}
export default NavBar;