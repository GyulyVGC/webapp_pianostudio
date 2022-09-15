import 'bootstrap/dist/css/bootstrap.min.css';

import { Button, Col, Table } from 'react-bootstrap';
import { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMinus } from 'react-icons/fi';
import { BsInfoCircle, BsClockHistory } from 'react-icons/bs';
import { GiExpand, GiContract } from 'react-icons/gi';
import { RiForbid2Line } from 'react-icons/ri';

import API from './API';
import MyAlerts from './MyAlerts';
import nightModeContext from './nightModeContext';

function MyPianoCourse(props) {

    let [expanded, setExpanded] = useState(false);
    const nightMode = useContext(nightModeContext).nightMode;

    const location = useLocation();
    let editPage = location.pathname === '/pianostudi/modifica';

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
                    </li>)}
            </ul>
    }

    let propedeutico = props.course.propedeutico;
    let propedeuticoList = '';
    if (propedeutico !== null) {
        propedeuticoList =
            <ul>
                {<li> {props.vett.filter(c => c.id === propedeutico)[0].codice} </li>}
            </ul>
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
                        Incompatibili:
                    </span>
                    {props.course.incompatibili === null ?
                        ' nessuno' :
                        incompatibiliList}
                    <br />
                    <span style={{ color: nightMode ? '#ff9900' : '#003cb3' }}>
                        Propedeutico:
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
        {editPage ?
            <td key="td4" style={{ textAlign: 'center' }}>
                {props.status === 'isPropedeutico' ?
                    <span title='È propedeutico ad altri tuoi corsi'>
                        <h5><RiForbid2Line style={{ cursor: 'pointer' }}
                            onClick={() => {
                                let propedeuticita = '';
                                for (let idInPiano of props.pianoProvvisorio) {
                                    let corsoInPiano = props.vett.filter(c => c.id === idInPiano)[0];
                                    if (corsoInPiano.propedeutico === props.course.id) {
                                        propedeuticita = props.vett.filter(c => c.id === idInPiano)[0].codice;;
                                    }
                                }
                                props.setErrorMessage(() => 'È propedeutico al corso ' + propedeuticita + '.');
                            }} /></h5>
                    </span> :
                    <h5><FiMinus style={{ cursor: props.loadCorsi || props.verifying ? '' : 'pointer' }}
                        onClick={() => {
                            if (props.loadCorsi === false && props.verifying === false) {
                                props.setVett(props.vett.map(c => c.id === props.course.id ?
                                    {
                                        ...c, iscritti: c.iscritti - 1
                                    } :
                                    c));
                                props.setPianoProvvisorio(props.pianoProvvisorio.filter(c => c !== props.course.id));
                                props.setCreditiProvvisori(props.creditiProvvisori - props.course.crediti);
                                props.setErrorMessage(() => '');
                            }
                        }} /></h5>}
            </td>
            : ''}
    </tr>);

    return (retVal);
}



function getPianoCourseStatus(courses, pianoProvvisorio, course) {
    //non posso toglierlo perché propedeutico per altri già inseriti
    for (let idInPiano of pianoProvvisorio) {
        let corsoInPiano = courses.filter(c => c.id === idInPiano)[0];
        if (corsoInPiano.propedeutico === course.id) {
            return 'isPropedeutico';
        }
    }
    return 'ok';
}



function AddPianoRows(props) {
    let pianoTable = [];
    for (let id of props.pianoProvvisorio) {
        let course = props.vett.filter(c => c.id === id)[0];
        let status = getPianoCourseStatus(props.vett, props.pianoProvvisorio, course);
        pianoTable.push(<MyPianoCourse key={id} status={status} loadCorsi={props.loadCorsi}
            course={course} setPianoProvvisorio={props.setPianoProvvisorio} vett={props.vett}
            pianoProvvisorio={props.pianoProvvisorio} setVett={props.setVett} allExpanded={props.allExpanded}
            setCreditiProvvisori={props.setCreditiProvvisori} creditiProvvisori={props.creditiProvvisori}
            errorMessage={props.errorMessage} setErrorMessage={props.setErrorMessage} verifying={props.verifying} />);
    }
    return pianoTable;
}



function MyPianoStudi(props) {
    const nightMode = useContext(nightModeContext).nightMode;
    const navigate = useNavigate();
    let [errorMessage, setErrorMessage] = useState('');
    let [allExpanded, setAllExpanded] = useState(false);

    const location = useLocation();
    let editPage = location.pathname === '/pianostudi/modifica';

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


    let buttonSalva =
        <Button className={props.loadCorsi || props.verifying ? 'btn-sm disabled' : 'btn-sm'}
            style={stylish}
            onClick={() => {
                let minCrediti = props.user.iscrizione === 'part-time' ? 20 : 60;
                let maxCrediti = props.user.iscrizione === 'part-time' ? 40 : 80;
                if (props.creditiProvvisori >= minCrediti && props.creditiProvvisori <= maxCrediti) {
                    //aspetto che i corsi della lista completa vengano ri-caricati dal server
                    //devo controllare che nessun corso abbia raggiunto il massimo di iscritti
                    //a seguito di modifiche contemporanee di altri utenti
                    let conflict = false;
                    props.setVerifying(() => true);
                    setErrorMessage(() => 'Verifico conflitti con altri utenti...');
                    API.getCourses()
                        .then((courses) => {
                            for (let cp of props.pianoProvvisorio) {
                                let corsoAggiornato = courses.filter(c => c.id === cp)[0];
                                if (corsoAggiornato.iscritti === corsoAggiornato.maxstudenti
                                    && props.pianoIniziale.filter(p => p === cp).length === 0) {
                                    conflict = corsoAggiornato.codice;
                                }
                            }
                            if (conflict === false) {
                                props.updatePiano(props.pianoProvvisorio, props.creditiProvvisori);
                                setErrorMessage(() => '');
                                props.setVerifying(() => false);
                                navigate('/pianostudi');
                            }
                            else {
                                //modifiche contemporanee!!!
                                props.setVerifying(() => false);
                                setErrorMessage(() => `Il corso ${conflict} ha raggiunto il massimo numero di iscritti!`);
                                //aggiorno il numero di iscritti ma solo in locale: devo risolvere il conflitto!!
                                props.setCourses(courses.map(c => props.pianoProvvisorio.filter(p => p === c.id).length === 1
                                    && props.pianoIniziale.filter(p => p === c.id).length === 0 ?
                                    { ...c, iscritti: c.iscritti + 1 } :
                                    props.pianoProvvisorio.filter(p => p === c.id).length === 0
                                        && props.pianoIniziale.filter(p => p === c.id).length === 1 ?
                                        { ...c, iscritti: c.iscritti - 1 } :
                                        c));
                            }
                        })
                        .catch(err => setErrorMessage(() => err.error));
                }
                else {
                    setErrorMessage(() => `Devi inserire tra ${minCrediti} e ${maxCrediti} crediti.`);
                }
            }}>Salva</Button>;

    let buttonElimina =
        <Button className={props.loadCorsi || props.verifying ? 'btn-sm disabled' : 'btn-sm'}
            variant='danger' style={{ color: 'black' }}
            onClick={() => {
                props.setCreditiProvvisori(0);
                props.setPianoProvvisorio([]);
                props.updatePiano([], 0);
                setErrorMessage(() => '');
                props.updateIscrizione(null);
                navigate('/iscrizione');
            }}>Elimina piano</Button>;

    let buttonAnnulla =
        <Button className={props.loadCorsi || props.verifying ? 'btn-sm disabled' : 'btn-sm'}
            style={{ color: 'black' }} variant='secondary'
            onClick={() => {
                props.setCourses(props.courses.map(c => props.pianoProvvisorio.filter(p => p === c.id).length === 1
                    && props.pianoIniziale.filter(p => p === c.id).length === 0 ?
                    { ...c, iscritti: c.iscritti - 1} :
                    props.pianoProvvisorio.filter(p => p === c.id).length === 0
                        && props.pianoIniziale.filter(p => p === c.id).length === 1 ?
                        { ...c, iscritti: c.iscritti + 1} :
                        c));
                props.setPianoProvvisorio(props.pianoIniziale);
                props.setCreditiProvvisori(props.creditiIniziali);
                setErrorMessage(() => '');
                navigate('/pianostudi');
            }}>Annulla modifiche</Button>;

    let visualizzaPiano =
        <Col key='col2' sm={5} style={{ borderLeft: '2px dotted' }}>
            <br />
            <h2>Piano studi {props.user.iscrizione} di {props.user.name}{props.loadPiano ? <> <BsClockHistory /></> : false}</h2>
            <br />
            {props.loadPianoInit ?
                <><h2>Ricevo il piano dal server...</h2></> :
                <>
                    {props.pianoIniziale.length === 0 ?
                        <>
                            <br />
                            <div style={{
                                position: 'fixed',
                                right: '1%',
                                left: '59%'
                            }}>
                                <hr />
                                <h5>
                                    <span style={{ marginLeft: '25%' }} />
                                    Il tuo piano di studi è vuoto.
                                    <br /><br />
                                    <span style={{ marginLeft: '40%' }} />
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
                            <Table hover variant={nightMode ? "dark" : "light"} >
                                <tbody >
                                    <tr style={{
                                        color: nightMode ? '#ff9900' : '#003cb3',
                                        position: 'sticky', top: '11%'
                                    }}>
                                        <th style={{ textAlign: 'center' }}>
                                            <BsInfoCircle style={{ cursor: 'pointer' }}
                                                onClick={() => setAllExpanded(old => !old)} />
                                        </th>
                                        <th style={{ textAlign: 'center' }}>Codice</th>
                                        <th>Nome</th>
                                        <th style={{ textAlign: 'center' }}>CFU</th>
                                    </tr>
                                    <AddPianoRows allExpanded={allExpanded} pianoProvvisorio={props.pianoIniziale} vett={props.courses} />
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

    let modificaPiano =
        <Col key='col2' sm={5} style={{ borderLeft: '2px dotted' }}>
            <br />
            <h2>Modifica il tuo piano</h2>
            {errorMessage ?
                <MyAlerts type={errorMessage.includes('crediti') || errorMessage.includes('raggiunto') ? 'error' : 'info'}
                    message={errorMessage} position='11%' setMessage={setErrorMessage}></MyAlerts> :
                false}
            {props.pianoProvvisorio.length === 0 ?
                <>
                    <br />
                    <br />
                    <div style={{
                        position: 'fixed',
                        right: '1%',
                        left: '59%'
                    }}>
                        <hr />
                        <h5>
                            Il tuo piano di studi è vuoto.
                            <br />
                            Inizia ad aggiungere i corsi che vorresti frequentare.
                            <br />
                        </h5>
                        <br />
                        <span style={{ marginLeft: '3%' }}></span>
                        {buttonSalva}
                        <span style={{ marginLeft: '19%' }}></span>
                        {buttonElimina}
                        <span style={{ marginLeft: '19%' }}></span>
                        {buttonAnnulla}
                        <hr />
                    </div>
                </>
                :
                <>
                    <br />
                    <Table hover variant={nightMode ? "dark" : "light"} >
                        <tbody >
                            <tr style={{
                                color: nightMode ? '#ff9900' : '#003cb3',
                                position: 'sticky', top: errorMessage ? '18%' : '11%'
                            }}>
                                <th style={{ textAlign: 'center' }}>
                                    <BsInfoCircle style={{ cursor: 'pointer' }}
                                        onClick={() => setAllExpanded(old => !old)} />
                                </th>
                                <th style={{ textAlign: 'center' }}>Codice</th>
                                <th>Nome</th>
                                <th style={{ textAlign: 'center' }}>CFU</th>
                                {editPage ?
                                    <th style={{ textAlign: 'center' }}>Rimuovi</th> :
                                    ''}
                            </tr>
                            <AddPianoRows pianoProvvisorio={props.pianoProvvisorio} loadCorsi={props.loadCorsi} allExpanded={allExpanded}
                                creditiProvvisori={props.creditiProvvisori} setCreditiProvvisori={props.setCreditiProvvisori}
                                vett={props.courses} setVett={props.setCourses} setPianoProvvisorio={props.setPianoProvvisorio}
                                errorMessage={errorMessage} setErrorMessage={setErrorMessage} verifying={props.verifying} />
                        </tbody>
                    </Table>
                    <div style={{
                        color: nightMode ? '#ff9900' : '#003cb3',
                        backgroundColor: nightMode ? '#212529' : '#FBFBFB',
                        position: 'sticky', top: '40%',
                        bottom: '5%'
                    }}>
                        Numero crediti concessi: tra
                        {props.user.iscrizione === 'part-time' ? ' 20 ' : ' 60 '}
                        e
                        {props.user.iscrizione === 'part-time' ? ' 40' : ' 80'}.
                        <br />
                        Al momento hai inserito {props.creditiProvvisori} crediti.
                        <br />
                        <span style={{ marginLeft: '3%' }}></span>
                        {buttonSalva}
                        <span style={{ marginLeft: '19%' }}></span>
                        {buttonElimina}
                        <span style={{ marginLeft: '19%' }}></span>
                        {buttonAnnulla}
                    </div>
                </>
            }
            <br />
        </Col >;

    return (
        editPage ? modificaPiano : visualizzaPiano
    )
}

export default MyPianoStudi;