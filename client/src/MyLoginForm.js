import { Form, Button, Col } from 'react-bootstrap';
import { useState, useContext } from 'react';
import nightModeContext from './nightModeContext';
import MyAlerts from './MyAlerts';
import Checkbox from '@mui/material/Checkbox';
import { FormControlLabel } from '@mui/material';

function MyLoginForm(props) {
    const [username, setUsername] = useState('io@io.it');
    const [password, setPassword] = useState('password');
    const [mostra, setMostra] = useState(false);

    const nightMode = useContext(nightModeContext).nightMode;

    const handleSubmit = (event) => {
        event.preventDefault();
        props.setErrorMessage('');
        const credentials = { username, password };

        let valid = true;

        var re = /\S+@\S+\.\S+/;
        let validEmail = re.test(username);

        if (username.trim().length === 0) {
            valid = false;
            props.setErrorMessage(() => "Devi specificare la tua email!");
        }
        else if (password.length < 6) {
            valid = false;
            props.setErrorMessage(() => 'La password deve essere lunga almeno 6 caratteri!');
        }
        else if (!validEmail) {
            valid = false;
            props.setErrorMessage(() => 'Formato email errato (deve essere nella forma "a@b.c")');
        }

        if (valid) {
            props.login(credentials);
        }
    };

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
            <Form onSubmit={handleSubmit} style={{
                position: 'fixed',
                right: '1%',
                left: '76%'
            }}>
                <br /><br /><br /><br /><br />
                <h1 style={{ marginLeft: '33%' }}>Login</h1>
                <br />
                {props.errorMessage ?
                    <MyAlerts type='error' setMessage={props.setErrorMessage} message={props.errorMessage} ></MyAlerts> : false}
                <Form.Group controlId='username'>
                    <Form.Label>email</Form.Label>
                    <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} />
                </Form.Group>
                <br />
                <Form.Group controlId='password'>
                    <Form.Label>Password</Form.Label>
                    <span style={{marginLeft: '40%'}} />
                    <FormControlLabel control={<Checkbox size='small' color={nightMode ? 'warning' : 'primary'} 
                        onClick={() => setMostra(oldMostra => !oldMostra)}/>}  label='mostra'/>
                    <Form.Control type={mostra ? 'text' : 'password'} value={password} onChange={ev => setPassword(ev.target.value)} />

                </Form.Group>

                <br />
                <span style={{ marginLeft: '39%' }}></span>
                <Button type='submit' style={stylish} onClick={handleSubmit}>Login</Button>
            </Form>
        </Col>
    )
}

export default MyLoginForm;