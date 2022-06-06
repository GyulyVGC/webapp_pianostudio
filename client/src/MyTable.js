import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Table } from 'react-bootstrap';
import { GiExpand, GiContract } from 'react-icons/gi';
import { FiPlus } from 'react-icons/fi';
import { RiForbid2Line } from 'react-icons/ri';
import { BsClockHistory } from 'react-icons/bs';
import { useContext, useState } from 'react';
import nightModeContext from './nightModeContext';
import { useLocation } from 'react-router-dom';
import MyAlerts from './MyAlerts';

function MyCourse(props) {

    let [expanded, setExpanded] = useState(false);
    const nightMode = useContext(nightModeContext).nightMode;

    let incompatibili = props.course.incompatibili;
    let incompatibiliList = '';
    if (incompatibili !== null) {
        incompatibiliList =
            <ul>
                {incompatibili.map(incomp => <li key={incomp}> {incomp} {'(' + props.vett.filter(c => c.codice === incomp)[0].nome + ')'}</li>)}
            </ul>
    }

    let propedeutico = props.course.propedeutico;
    let propedeuticoList = '';
    if (propedeutico !== null) {
        propedeuticoList =
            <ul>
                {<li> {props.course.propedeutico + ' (' +
                    props.vett.filter(c => c.codice === props.course.propedeutico)[0].nome + ')'} </li>}
            </ul>
    }

    let statusComponent;
    switch (props.status) {
        case 'ok':
            statusComponent =
                <h5><FiPlus style={{ cursor: props.loadCorsi ? '' : 'pointer' }}
                    onClick={() => {
                        if (props.loadCorsi === false) {
                            props.setVett(props.vett.map(c => c.codice === props.course.codice ?
                                { ...c, iscritti: c.iscritti + 1, dirty: true } :
                                c));
                            props.setPianoProvvisorio(props.pianoProvvisorio.concat(props.course.codice));
                            props.setCreditiProvvisori(props.creditiProvvisori + props.course.crediti);
                        }
                    }} /></h5>;
            break;
        case 'alreadyInserted':
            statusComponent = 'Inserito';
            break;
        case 'needPropedeutico':
            statusComponent =
                <span title='Manca il corso propedeutico!'>
                    <h5><RiForbid2Line style={{ cursor: 'pointer' }}
                        onClick={() => {
                            props.setErrorMessage(() => 'Devi prima inserire il corso propedeutico (' + props.course.propedeutico + ').');
                        }} /></h5>
                </span>
            break;
        case 'noPosti':
            statusComponent =
                <span title='Limite di iscritti raggiunto!'>
                    <h5><RiForbid2Line style={{ cursor: 'pointer' }}
                        onClick={() => {
                            props.setErrorMessage(() => 'Il corso ' + props.course.codice + ' non ha attualmente posti disponibili.');
                        }} /></h5>
                </span>
            break;
        case 'incompatibile':
            statusComponent =
                <span title='Incompatibile con il tuo piano!'>
                    <h5><RiForbid2Line style={{ cursor: 'pointer' }}
                        onClick={() => {
                            let incompatibilita = '';
                            for (let incomp of incompatibili) {
                                if (props.pianoProvvisorio.filter(pr => pr === incomp).length === 1) {
                                    incompatibilita = incomp;
                                }
                            }
                            props.setErrorMessage(() => 'Incompatibile con il corso ' + incompatibilita + ' già inserito.')
                        }} /></h5>
                </span>
            break;
        default:
            break;
    }

    let retVal = [];
    retVal.push(<tr key="tr1" style={{ height: '50px' }}>
        <td key="td1" style={{ textAlign: 'center' }}>
            {props.course.codice}
        </td>
        <td key="td2">
            {props.course.nome}
            {expanded ?
                <>
                    <br /><br />
                    <span style={{ color: nightMode ? '#ff9900' : '#003cb3' }}>
                        Corsi incompatibili:
                    </span>
                    {props.course.incompatibili === null ?
                        ' nessuno' :
                        incompatibiliList}
                    <br />
                    <span style={{ color: nightMode ? '#ff9900' : '#003cb3' }}>
                        Corso propedeutico:
                    </span>
                    {props.course.propedeutico === null ?
                        ' nessuno' :
                        propedeuticoList}
                    <br />
                </>
                :
                ""
            }
        </td>
        <td key="td3" style={{ textAlign: 'center' }}>
            {props.course.crediti}
        </td>
        <td key="td4" style={{ textAlign: 'center' }}>
            {props.course.iscritti}
        </td>
        <td key="td5" style={{ textAlign: 'center' }}>
            {props.course.maxstudenti === null ? 'Senza limite' : props.course.maxstudenti}
        </td>
        <td key="td6" style={{ textAlign: 'center' }}>
            {expanded ?
                <h5><GiContract style={{ cursor: 'pointer' }} onClick={() => setExpanded(false)} /></h5>
                :
                <h5><GiExpand style={{ cursor: 'pointer' }} onClick={() => setExpanded(true)} /></h5>
            }
        </td>
        {props.editPage ?
            <td key="td7" style={{ textAlign: 'center' }}>
                {statusComponent}
            </td> :
            ''}

    </tr>);

    return (retVal);
}

function getCourseStatus(pianoProvvisorio, course) {
    //già presente
    if (pianoProvvisorio.filter(c => c === course.codice).length === 1) {
        return 'alreadyInserted';
    }
    //manca il corso propedeutico
    else if (course.propedeutico !== null) {
        if (pianoProvvisorio.filter(c => c === course.propedeutico).length === 0) {
            return 'needPropedeutico';
        }
    }
    //incompatibile con uno già presente
    else if (course.incompatibili !== null) {
        for (let incomp of course.incompatibili) {
            if (pianoProvvisorio.filter(c => c === incomp).length !== 0) {
                return 'incompatibile';
            }
        }
    }
    else if (course.iscritti === course.maxstudenti) {
        return 'noPosti';
    }
    return 'ok';
}

function AddRows(props) {
    let courseTable = [];
    for (let course of props.vett) {
        let status = getCourseStatus(props.pianoProvvisorio, course);
        courseTable.push(<MyCourse editPage={props.editPage} key={course.codice}
            vett={props.vett} setVett={props.setVett} loadCorsi={props.loadCorsi}
            course={course} pianoProvvisorio={props.pianoProvvisorio}
            creditiProvvisori={props.creditiProvvisori} setCreditiProvvisori={props.setCreditiProvvisori}
            setPianoProvvisorio={props.setPianoProvvisorio} status={status}
            errorMessage={props.errorMessage} setErrorMessage={props.setErrorMessage} />);
    }
    return courseTable;
}

function MyTable(props) {
    const nightMode = useContext(nightModeContext).nightMode;

    const location = useLocation();
    let editPage = location.pathname === '/pianostudi/modifica';
    let [errorMessage, setErrorMessage] = useState('');

    let retVal = [];
    retVal.push(<Col key="col1" sm={editPage ? 8 : 9}>
        <h1>Corsi offerti</h1>
        {errorMessage ?
            <MyAlerts type='info' message={errorMessage} position='11%'
                setMessage={setErrorMessage}></MyAlerts> :
            props.serverError ?
                <MyAlerts type='error' message={props.serverError} position='11%'
                    setMessage={props.setServerError}></MyAlerts> :
                false}
        <br />
        {props.loadCorsiInit ?
            <><h2>Ricevo i corsi dal server...</h2></> :
            <>
                {props.loadCorsi ? <h4>Sincronizzo... <BsClockHistory /></h4> : false}
                <Table hover variant={nightMode ? "dark" : "light"}>
                    <tbody >
                        <tr style={{
                            color: nightMode ? '#ff9900' : '#003cb3',
                            position: 'sticky', top: errorMessage || props.serverError ? '18%' : '11%'
                        }}>
                            <th style={{ textAlign: 'center' }}>Codice</th>
                            <th>Nome</th>
                            <th style={{ textAlign: 'center' }}>Crediti</th>
                            <th style={{ textAlign: 'center' }}>Iscritti</th>
                            <th style={{ textAlign: 'center' }}>Limite&nbsp;iscritti<nobr /></th>
                            <th style={{ textAlign: 'center' }}>Dettagli</th>
                            {editPage ?
                                <th style={{ textAlign: 'center' }}>Aggiungi</th> :
                                ''}
                        </tr>
                        <AddRows editPage={editPage} vett={props.courses} setVett={props.setCourses}
                            pianoProvvisorio={props.pianoProvvisorio} setPianoProvvisorio={props.setPianoProvvisorio}
                            creditiProvvisori={props.creditiProvvisori} setCreditiProvvisori={props.setCreditiProvvisori}
                            errorMessage={errorMessage} setErrorMessage={setErrorMessage} loadCorsi={props.loadCorsi} />
                    </tbody>
                </Table>
            </>
        }
    </Col>);

    return (
        retVal
    );
}

export default MyTable;