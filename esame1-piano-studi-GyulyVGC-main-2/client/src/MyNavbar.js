import 'bootstrap/dist/css/bootstrap.min.css';

import Switch from '@mui/material/Switch';

import { useContext } from 'react';
import { ImBooks } from 'react-icons/im';
import { FaUserCheck, FaUserSlash } from 'react-icons/fa';
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import { BsSun, BsSunFill, BsMoonStarsFill, BsMoonStars } from 'react-icons/bs';

import nightModeContext from './nightModeContext';

function MyNavbar(props) {
    
    const nightMode = useContext(nightModeContext).nightMode;
    const updateNightMode = useContext(nightModeContext).updateNightMode;

    let stylish = nightMode ?
        { background: "linear-gradient(to right,#FF4E50,#F9D423)", height: '11%' } :
        { background: "linear-gradient(to right,#076585,#fff)", height: '11%' };

    return (
        <Navbar fixed="top" style={stylish}
            variant={"light"} >

            <span style={{ marginLeft: '10%' }}></span>

            <h4>{nightMode ? <BsSun /> : <BsSunFill />}</h4>
            <Switch defaultChecked color="default" onChange={() => updateNightMode()} />
            <h4>{nightMode ? <BsMoonStarsFill /> : <BsMoonStars />}</h4>

            <span style={{ marginLeft: '23%' }}></span>

            <Nav >
                <h1><ImBooks /></h1>
                <Nav.Link disabled><h2 style={{color:'black'}}>Piano di studi</h2></Nav.Link>
            </Nav>

            <span style={{ marginLeft: '25%' }}></span>

            {props.loggedIn ?
                <Nav>
                    <NavDropdown title={<FaUserCheck />} id="basic-nav-dropdown">
                        <NavDropdown.Item style={{color: 'black'}} disabled >{props.user.name}</NavDropdown.Item>
                        <NavDropdown.Item style={{color: 'black'}} disabled>{
                            props.user.iscrizione ?
                                'Iscritto '+props.user.iscrizione :
                                'Non sei iscritto'
                        }</NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item onClick={props.logOut}>Logout</NavDropdown.Item>
                    </NavDropdown>
                </Nav>
                :
                <Nav>
                    <NavDropdown title={<FaUserSlash />} id="basic-nav-dropdown">
                        <NavDropdown.Item disabled>Utente non autenticato</NavDropdown.Item>
                    </NavDropdown>
                </Nav>}


        </Navbar>

    );
}

export default MyNavbar;
