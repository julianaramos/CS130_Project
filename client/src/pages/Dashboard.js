import React from 'react'
//import TextField from '@mui/material/TextField';
//import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Masonry from '@mui/lab/Masonry';
import { useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import ButtonGroup from '@mui/material-next/ButtonGroup';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';

import Diagram_img from '../images/UML-Class-Diagram.png'
import NavBar from './NavBar';
import { Link, Navigate, useNavigate } from 'react-router-dom';

const Dashboard = () => {

    const isSmallScreen = useMediaQuery('(max-width:600px)');
    const columns = isSmallScreen ? 1 : 3;
    const navigate = useNavigate()
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
        }

    ]

    const handleCreateClick = () => {
        navigate('/query');
    }

    return(
        <Container                 
            sx={{
            pt: "7rem",
            pb: "5rem",
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: { xs: 3, sm: 6 },
        }}>
            <Box>
                <Button onClick={handleCreateClick} variant='outlined' startIcon={<AddIcon/>}>Create</Button>
            </Box>
            <Masonry columns={columns} spacing={2}>
                {userUML.map((UML, index) => (
                <Card key={index} sx={{ p: 1 }}>
                    <CardMedia 
                        sx={{ height: 180 }}
                        image={UML.diagram}
                        title='UML Diagram' 
                    /> 
                    <ButtonGroup>
                        <Button variant='filled' startIcon={<EditIcon/>}>Edit</Button>
                        <Button variant='filled' startIcon={<DownloadIcon/>}>Download</Button>
                    </ButtonGroup>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
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
    );
}

export default Dashboard;
