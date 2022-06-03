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
            <h2>Benvenuto {props.user.name}! </h2>
            <br />
            <div style={{
                position: 'fixed',
                right: '1%',
                left: '76%'
            }}>
                <hr />
                <br />
                <h5>
                    Sembra che tu non sia ancora iscritto.
                    <br /> <br/>
                    Scegli il tipo di iscrizione:
                </h5>
                <br />
                <span style={{ marginLeft: '12%' }} />
                <Button style={stylish} onClick={() => {
                    props.updateIscrizione('part-time');
                    navigate('/pianoStudi');
                }} >Part-time</Button>
                <span style={{ marginLeft: '12%' }} />
                <Button style={stylish} onClick={() => {
                    props.updateIscrizione('full-time');
                    navigate('/pianoStudi');
                }} >Full-time</Button>
                <br/> <br/>
                <hr />
            </div>
        </Col>
    )
}

export default MyIscrizione;