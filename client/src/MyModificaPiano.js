import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Col, Table } from 'react-bootstrap';
import { useContext, useState } from 'react';
import nightModeContext from './nightModeContext';
import { useNavigate } from 'react-router-dom';
import { FiMinus } from 'react-icons/fi';
import { RiForbid2Line } from 'react-icons/ri';
import MyAlerts from './MyAlerts';

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
        <td key="td4" style={{ textAlign: 'center' }}>
            {props.status === 'isPropedeutico' ?
                <span title='È propedeutico ad altri tuoi corsi'>
                    <h5><RiForbid2Line style={{ cursor: 'pointer' }}
                        onClick={() => {
                            let propedeuticita = '';
                            for (let codiceInPiano of props.pianoProvvisorio) {
                                let corsoInPiano = props.vett.filter(c => c.codice === codiceInPiano)[0];
                                if (corsoInPiano.propedeutico === props.course.codice) {
                                    propedeuticita = codiceInPiano;
                                }
                            }
                            props.setErrorMessage(() => 'È propedeutico al corso ' + propedeuticita + '.');
                        }} /></h5>
                </span> :
                <h5><FiMinus style={{ cursor: props.loadCorsi ? '' : 'pointer' }}
                    onClick={() => {
                        if (props.loadCorsi === false) {
                            props.setVett(props.vett.map(c => c.codice === props.course.codice ?
                                { ...c, iscritti: c.iscritti - 1, dirty: true } :
                                c));
                            props.setPianoProvvisorio(props.pianoProvvisorio.filter(c => c !== props.course.codice));
                            props.setCreditiProvvisori(props.creditiProvvisori - props.course.crediti);
                        }
                    }} /></h5>}
        </td>
    </tr>);

    return (retVal);
}

function getPianoCourseStatus(courses, pianoProvvisorio, course) {
    //non posso toglierlo perché propedeutico per altri già inseriti
    for (let codiceInPiano of pianoProvvisorio) {
        let corsoInPiano = courses.filter(c => c.codice === codiceInPiano)[0];
        if (corsoInPiano.propedeutico === course.codice) {
            return 'isPropedeutico';
        }
    }
    return 'ok';
}



function AddPianoRows(props) {
    let pianoTable = [];
    for (let codice of props.pianoProvvisorio) {
        let course = props.vett.filter(c => c.codice === codice)[0];
        let status = getPianoCourseStatus(props.vett, props.pianoProvvisorio, course);
        pianoTable.push(<MyPianoCourse key={codice} status={status} loadCorsi={props.loadCorsi}
            course={course} setPianoProvvisorio={props.setPianoProvvisorio} vett={props.vett}
            pianoProvvisorio={props.pianoProvvisorio} setVett={props.setVett}
            setCreditiProvvisori={props.setCreditiProvvisori} creditiProvvisori={props.creditiProvvisori}
            errorMessage={props.errorMessage} setErrorMessage={props.setErrorMessage} />);
    }
    return pianoTable;
}

function MyModificaPiano(props) {
    const nightMode = useContext(nightModeContext).nightMode;
    const navigate = useNavigate();
    let [errorMessage, setErrorMessage] = useState('');

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

    let buttonSalva = <Button className={props.loadCorsi ? 'btn-sm disabled' : 'btn-sm'} 
        style={stylish}
        onClick={() => {
            if (props.user.iscrizione === 'part-time') {
                if (props.creditiProvvisori >= 20 && props.creditiProvvisori <= 40) {
                    props.updatePiano(props.pianoProvvisorio, props.creditiProvvisori);
                    props.updateIscrittiCorsi(props.courses);
                    navigate('/pianostudi');
                }
                else {
                    setErrorMessage(() => 'Devi inserire tra 20 e 40 crediti.');
                }
            }
            if (props.user.iscrizione === 'full-time') {
                if (props.creditiProvvisori >= 60 && props.creditiProvvisori <= 80) {
                    props.updatePiano(props.pianoProvvisorio, props.creditiProvvisori);
                    props.updateIscrittiCorsi(props.courses);
                    navigate('/pianostudi');
                }
                else {
                    setErrorMessage(() => 'Devi inserire tra 60 e 80 crediti.');
                }
            }
        }}>Salva</Button>;

    let buttonElimina = <Button className={props.loadCorsi ? 'btn-sm disabled' : 'btn-sm'} 
         variant='danger' style={{ color: 'black' }}
        onClick={() => {
            props.setCourses(props.courses.map(c => props.pianoProvvisorio.filter(p => p === c.codice).length === 1 ?
                { ...c, iscritti: c.iscritti - 1, dirty: true } :
                c));
            props.updateIscrittiCorsi(props.courses.map(c => props.pianoProvvisorio.filter(p => p === c.codice).length === 1 ?
                { ...c, iscritti: c.iscritti - 1, dirty: true } :
                c));
            props.setCreditiProvvisori(0);
            props.setPianoProvvisorio([]);
            props.updatePiano([], 0);
            navigate('/pianostudi');
        }}>Elimina piano</Button>;

    let buttonAnnulla = <Button className={props.loadCorsi ? 'btn-sm disabled' : 'btn-sm'}
        style={{ color: 'black' }} variant='secondary'
        onClick={() => {
            props.setCourses(props.courses.map(c => props.pianoProvvisorio.filter(p => p === c.codice).length === 1
                && props.pianoIniziale.filter(p => p === c.codice).length === 0 ?
                { ...c, iscritti: c.iscritti - 1, dirty: false } :
                props.pianoProvvisorio.filter(p => p === c.codice).length === 0
                    && props.pianoIniziale.filter(p => p === c.codice).length === 1 ?
                    { ...c, iscritti: c.iscritti + 1, dirty: false } :
                    c));
            props.setPianoProvvisorio(props.pianoIniziale);
            props.setCreditiProvvisori(props.creditiIniziali);
            navigate('/pianostudi');
        }}>Annulla modifiche</Button>;

    return (
        <Col key='col2' sm={4} style={{ borderLeft: '2px dotted' }}>
            <br />
            <h2>Piano di studi</h2>
            {errorMessage ?
                <MyAlerts type={errorMessage.includes('crediti') ? 'error' : 'info'}
                    message={errorMessage} position='11%' setMessage={setErrorMessage}></MyAlerts> :
                false}
            {props.pianoProvvisorio.length === 0 ?
                <>
                    <br />
                    <br />
                    <div style={{
                        position: 'fixed',
                        right: '1%',
                        left: '68%'
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
                        <span style={{ marginLeft: '13%' }}></span>
                        {buttonElimina}
                        <span style={{ marginLeft: '10%' }}></span>
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
                                <th style={{ textAlign: 'center' }}>Codice</th>
                                <th>Nome</th>
                                <th style={{ textAlign: 'center' }}>Crediti</th>
                                <th style={{ textAlign: 'center' }}>Rimuovi</th>
                            </tr>
                            <AddPianoRows pianoProvvisorio={props.pianoProvvisorio} loadCorsi={props.loadCorsi}
                                creditiProvvisori={props.creditiProvvisori} setCreditiProvvisori={props.setCreditiProvvisori}
                                vett={props.courses} setVett={props.setCourses} setPianoProvvisorio={props.setPianoProvvisorio}
                                errorMessage={errorMessage} setErrorMessage={setErrorMessage} />
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
                        {props.user.iscrizione === 'part-time' ? ' 40 ' : ' 80'}.
                        <br />
                        Al momento hai inserito {props.creditiProvvisori} crediti.
                        <br />
                        <span style={{ marginLeft: '3%' }}></span>
                        {buttonSalva}
                        <span style={{ marginLeft: '13%' }}></span>
                        {buttonElimina}
                        <span style={{ marginLeft: '10%' }}></span>
                        {buttonAnnulla}
                    </div>
                </>
            }
            <br />
        </Col >
    )
}

export default MyModificaPiano;