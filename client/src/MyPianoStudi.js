import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Col } from 'react-bootstrap';
import { useContext } from 'react';
import nightModeContext from './nightModeContext';
import { useNavigate } from 'react-router-dom';

function MyIscrizione(props) {
    const nightMode = useContext(nightModeContext).nightMode;
    const navigate = useNavigate();

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
        <Col key='col2' sm={3} style={{ borderLeft: '2px dotted' }}>
            <br />
            <h2>Piano di studi</h2>
            <br />
            <div style={{
                position: 'fixed',
                right: '1%',
                left: '76%'
            }}>
                <hr />
                <br />
                <h5>
                    {props.piano.length === 0 ?
                        <>
                            <span style={{ marginLeft: '7%' }} />
                            Il tuo piano di studi è vuoto.
                            <br/><br/>
                            <span style={{ marginLeft: '27%' }} />
                            <Button style={stylish} onClick={() => {
                                navigate('/pianoStudi/modifica');
                            }} >Aggiungi corsi</Button>
                        </>
                        :
                        'piano pieno'
                    }
                </h5>
                <br />
                <hr />
            </div>
        </Col>
    )
}

export default MyIscrizione;