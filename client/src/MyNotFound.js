import 'bootstrap/dist/css/bootstrap.min.css';

import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { Button } from 'react-bootstrap';

import nightModeContext from './nightModeContext';

function MyNotFound() {
    const navigate = useNavigate();
    const nightMode = useContext(nightModeContext).nightMode;

    let stylish = nightMode ?
        {
            background: "#F1C821",
            color: 'black',
            borderColor: 'red',
            borderWidth: '2px'
        } :
        {
            background: "#B4E7E4",
            color: 'black',
            borderColor: 'blue',
            borderWidth: '2px'
        };

    return (
        <div style={{ position: 'fixed', top: '38%' }}>
            <h1>
                <hr />
                <span style={{ marginLeft: '10%' }} />
                La pagina richiesta non esiste
                <span style={{ marginLeft: '25%' }} />
                <Button style={stylish} onClick={() => navigate('/')} >Vai all'applicazione</Button>
                <hr />
            </h1>
        </div>
    );
}

export default MyNotFound;