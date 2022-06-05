import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, Form, NavDropdown } from "react-bootstrap";
import { ImBooks } from 'react-icons/im';
import { FaUserCheck, FaUserSlash } from 'react-icons/fa';
import { BsSun, BsSunFill, BsMoonStarsFill, BsMoonStars } from 'react-icons/bs';
import { useContext } from 'react';
import nightModeContext from './nightModeContext';
import { useNavigate } from 'react-router-dom';

function MyNavbar(props) {
    const nightMode = useContext(nightModeContext).nightMode;
    const updateNightMode = useContext(nightModeContext).updateNightMode;
    const navigate = useNavigate();

    let stylish = nightMode ?
        { background: "linear-gradient(to right,#FF4E50,#F9D423)", height: '11%' } :
        { background: "linear-gradient(to right,#076585,#fff)", height: '11%' };

    return (
        <Navbar fixed="top" style={stylish}
            variant={"light"} >

            <span style={{ marginLeft: '10%' }}></span>

            <h4>{nightMode ? <BsSun /> : <BsSunFill />}</h4>
            <span style={{ marginLeft: '5px' }}></span>
            <Form.Check defaultChecked type="switch" onChange={() => updateNightMode()} />
            <h4>{nightMode ? <BsMoonStarsFill /> : <BsMoonStars />}</h4>

            <span style={{ marginLeft: '23%' }}></span>

            <Nav >
                <h1><ImBooks style={{ cursor: 'pointer' }} onClick={() => navigate('/')} /></h1>
                <Nav.Link active onClick={() => navigate('/')}><h2>Piano di studi</h2></Nav.Link>
            </Nav>

            <span style={{ marginLeft: '25%' }}></span>

            {props.loggedIn ?
                <Nav>
                    <NavDropdown title={<FaUserCheck />} id="basic-nav-dropdown">
                        <NavDropdown.Item disabled >{props.user.name}</NavDropdown.Item>
                        <NavDropdown.Item disabled >{
                            props.user.iscrizione ?
                                'Iscrizione '+props.user.iscrizione :
                                'Non sei iscritto'
                        }</NavDropdown.Item>
                        <NavDropdown.Divider />
                        {<span title={props.piano.length === 0 ? '' : 'Devi prima eliminare il tuo piano!'}>
                            <NavDropdown.Item className={props.piano.length === 0 ? '' : 'disabled'}
                            onClick={() => navigate('/iscrizione')}>Modifica iscrizione</NavDropdown.Item>
                        </span>}
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
