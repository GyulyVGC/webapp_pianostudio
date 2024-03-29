import 'bootstrap/dist/css/bootstrap.min.css';

import { Col, Table } from 'react-bootstrap';
import { GiExpand, GiContract } from 'react-icons/gi';
import { FiPlus } from 'react-icons/fi';
import { RiForbid2Line } from 'react-icons/ri';
import { BsClockHistory, BsInfoCircle } from 'react-icons/bs';
import { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import MyAlerts from './MyAlerts';
import nightModeContext from './nightModeContext';

function MyCourse(props) {

    let [expanded, setExpanded] = useState(false);
    const nightMode = useContext(nightModeContext).nightMode;

    useEffect(() => {
        setExpanded(props.allExpanded);
    }, [props.allExpanded]);

    let incompatibili = props.course.incompatibili;
    let incompatibiliList = '';
    if (incompatibili !== null) {
        incompatibiliList =
            <ul>
                {incompatibili.map(incomp =>
                    <li key={incomp}> {props.vett.filter(c => c.id === incomp)[0].codice}
                        {' (' + props.vett.filter(c => c.id === incomp)[0].nome + ')'}</li>)}
            </ul>
    }

    let propedeutico = props.course.propedeutico;
    let propedeuticoList = '';
    if (propedeutico !== null) {
        propedeuticoList =
            <ul>
                {<li> {props.vett.filter(c => c.id === propedeutico)[0].codice + ' (' +
                    props.vett.filter(c => c.id === propedeutico)[0].nome + ')'} </li>}
            </ul>
    }

    let statusComponent;
    switch (props.status) {
        case 'ok':
            statusComponent =
                <h5><FiPlus style={{ cursor: props.loadCorsi || props.verifying ? '' : 'pointer' }}
                    onClick={() => {
                        if (props.loadCorsi === false && props.verifying === false) {
                            props.setVett(props.vett.map(c => c.id === props.course.id ?
                                { ...c, iscritti: c.iscritti + 1 } :
                                c));
                            props.setPianoProvvisorio(props.pianoProvvisorio.concat(props.course.id));
                            props.setCreditiProvvisori(props.creditiProvvisori + props.course.crediti);
                            props.setErrorMessage(() => '');
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
                            props.setErrorMessage(() => 'Devi prima inserire il corso propedeutico ('
                                + props.vett.filter(c => c.id === props.course.propedeutico)[0].codice
                                + ').');
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
                                    incompatibilita = props.vett.filter(c => c.id === incomp)[0].codice;
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

        <td key="td0" style={{ textAlign: 'center' }}>
            {expanded ?
                <h5><GiContract style={{ cursor: 'pointer' }} onClick={() => setExpanded(false)} /></h5>
                :
                <h5><GiExpand style={{ cursor: 'pointer' }} onClick={() => setExpanded(true)} /></h5>
            }
        </td>
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
        <td key="td4" style={{ textAlign: 'center', 
            color: props.course.iscritti > props.course.maxstudenti && props.course.maxstudenti !== null ? 'red' : ''  }}>
            {props.course.iscritti}
        </td>
        <td key="td5" style={{ textAlign: 'center' }}>
            {props.course.maxstudenti === null ? 'Senza limite' : props.course.maxstudenti}
        </td>
        {props.editPage ?
            <td key="td6" style={{ textAlign: 'center' }}>
                {statusComponent}
            </td> :
            ''}

    </tr>);

    return (retVal);
}



function getCourseStatus(pianoProvvisorio, course) {
    //già presente
    if (pianoProvvisorio.filter(c => c === course.id).length === 1) {
        return 'alreadyInserted';
    }
    //incompatibile con uno già presente
    if (course.incompatibili !== null) {
        for (let incomp of course.incompatibili) {
            if (pianoProvvisorio.filter(c => c === incomp).length !== 0) {
                return 'incompatibile';
            }
        }
    }
    //manca il corso propedeutico
    if (course.propedeutico !== null) {
        if (pianoProvvisorio.filter(c => c === course.propedeutico).length === 0) {
            return 'needPropedeutico';
        }
    }
    //massimo iscritti raggiunto
    if (course.iscritti === course.maxstudenti) {
        return 'noPosti';
    }
    return 'ok';
}



function AddRows(props) {
    let courseTable = [];
    for (let course of props.vett) {
        let status = getCourseStatus(props.pianoProvvisorio, course);
        courseTable.push(<MyCourse editPage={props.editPage} key={course.id}
            vett={props.vett} setVett={props.setVett} loadCorsi={props.loadCorsi}
            course={course} pianoProvvisorio={props.pianoProvvisorio} allExpanded={props.allExpanded}
            creditiProvvisori={props.creditiProvvisori} setCreditiProvvisori={props.setCreditiProvvisori}
            setPianoProvvisorio={props.setPianoProvvisorio} status={status} verifying={props.verifying}
            errorMessage={props.errorMessage} setErrorMessage={props.setErrorMessage} />);
    }
    return courseTable;
}



function MyTable(props) {
    const nightMode = useContext(nightModeContext).nightMode;

    const location = useLocation();
    let editPage = location.pathname === '/pianostudi/modifica';
    let pianoPage = location.pathname === '/pianostudi';
    let [errorMessage, setErrorMessage] = useState('');
    let [allExpanded, setAllExpanded] = useState(false);

    let retVal = [];
    retVal.push(<Col key="col1" sm={editPage || pianoPage ? 7 : 9}>
        <h1>Corsi offerti {props.loadCorsi ? <>... <BsClockHistory /> ...</> : false}</h1>
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
                <Table hover variant={nightMode ? "dark" : "light"}>
                    <tbody >
                        <tr style={{
                            color: nightMode ? '#ff9900' : '#003cb3',
                            position: 'sticky',
                            top: errorMessage || props.serverError ? '18%' : '11%'
                        }}>
                            <th style={{ textAlign: 'center' }}>
                                <BsInfoCircle style={{ cursor: 'pointer' }}
                                    onClick={() => setAllExpanded(old => !old)} />
                            </th>
                            <th style={{ textAlign: 'center' }}>Codice</th>
                            <th>Nome</th>
                            <th style={{ textAlign: 'center' }}>CFU</th>
                            <th style={{ textAlign: 'center' }}>Iscritti</th>
                            <th style={{ textAlign: 'center' }}>Limite&nbsp;iscritti<nobr /></th>
                            {editPage ?
                                <th style={{ textAlign: 'center' }}>Aggiungi</th> :
                                ''}
                        </tr>
                        <AddRows editPage={editPage} vett={props.courses} setVett={props.setCourses} allExpanded={allExpanded}
                            pianoProvvisorio={props.pianoProvvisorio} setPianoProvvisorio={props.setPianoProvvisorio}
                            creditiProvvisori={props.creditiProvvisori} setCreditiProvvisori={props.setCreditiProvvisori}
                            errorMessage={errorMessage} setErrorMessage={setErrorMessage} loadCorsi={props.loadCorsi} verifying={props.verifying} />
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