import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'react-bootstrap';
import nightModeContext from './nightModeContext';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';

function MyNotFound() {
    const navigate = useNavigate();
    const nightMode = useContext(nightModeContext).nightMode;
    return (
        <>
            <h1>Error: route not found <Button onClick={() => navigate('/')} variant={nightMode ? 'warning' : 'secondary'} >Back home</Button></h1>
        </>
    );
}

export default MyNotFound;