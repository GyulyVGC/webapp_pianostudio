import 'bootstrap/dist/css/bootstrap.min.css';

import { Button, Col, Table } from 'react-bootstrap';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsClockHistory } from 'react-icons/bs';

import nightModeContext from './nightModeContext';

function MyPianoCourse(props) {

    let retVal = [];
    retVal.push(<tr key="tr1" style={{ height: '50px' }}>
        <td key="td1" style={{ textAlign: 'center' }}>
            {props.course.codice}
        </td>
        <td key="td2">
            {props.course.nome}
        </td>
        <td key="td3" style={{ textAlign: 'center' }}>
            {props.course.crediti}
        </td>
    </tr>);

    return (retVal);
}



function AddPianoRows(props) {
    let pianoTable = [];
    for (let id of props.piano) {
        let course = props.vett.filter(c => c.id === id)[0];
        pianoTable.push(<MyPianoCourse key={id} course={course} />);
    }
    return pianoTable;
}



function MyPianoStudi(props) {
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
            {props.loadPianoInit ?
                <><h2>Ricevo il piano dal server...</h2></> :
                <>
                    {props.piano.length === 0 ?
                        <>
                            {props.loadPiano ? <h4>Sincronizzo... <BsClockHistory /></h4> : false}
                            <br />
                            <div style={{
                                position: 'fixed',
                                right: '1%',
                                left: '76%'
                            }}>
                                <hr />
                                <h5>
                                    <span style={{ marginLeft: '7%' }} />
                                    Il tuo piano di studi è vuoto.
                                    <br /><br />
                                    <span style={{ marginLeft: '27%' }} />
                                    <Button className={props.loadCorsi || props.LoadPiano ? 'btn-sm disabled' : 'btn-sm'}
                                        style={stylish} 
                                        onClick={() => {
                                        props.setLoadCorsi();
                                        navigate('/pianostudi/modifica');
                                    }} >Aggiungi corsi</Button>
                                </h5>
                                <hr />
                            </div>
                        </>
                        :
                        <>
                            {props.loadPiano ? <h4>Sincronizzo... <BsClockHistory /></h4> : false}
                            <Table hover variant={nightMode ? "dark" : "light"} >
                                <tbody >
                                    <tr style={{
                                        color: nightMode ? '#ff9900' : '#003cb3',
                                        position: 'sticky', top: '11%'
                                    }}>
                                        <th style={{ textAlign: 'center' }}>Codice</th>
                                        <th>Nome</th>
                                        <th style={{ textAlign: 'center' }}>Crediti</th>
                                    </tr>
                                    <AddPianoRows piano={props.piano} vett={props.courses} />
                                </tbody>
                            </Table>
                            <div style={{
                                backgroundColor: nightMode ? '#212529' : '#FBFBFB',
                                position: 'sticky', bottom: '5%', top: '47%'
                            }}>
                                <span style={{ marginLeft: '35%' }}></span>
                                <Button className={props.loadCorsi || props.LoadPiano ? 'btn-sm disabled' : 'btn-sm'}
                                    style={stylish} variant='secondary'
                                    onClick={() => {
                                        props.setLoadCorsi();
                                        navigate('/pianostudi/modifica');
                                    }}>Modifica piano</Button>
                            </div>
                        </>
                    }
                </>}
            <br />
        </Col>
    )
}

export default MyPianoStudi;