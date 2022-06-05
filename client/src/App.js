import 'bootstrap/dist/css/bootstrap.min.css';
import { Row } from 'react-bootstrap';
import './App.css';
import React, { useEffect, useState } from 'react';
import MyNavbar from './MyNavbar.js';
import MyTable from './MyTable.js';
import MyFooter from './MyFooter.js';
import MyNotFound from './MyNotFound';
import MyIscrizione from './MyIscrizione';
import MyPianoStudi from './MyPianoStudi';
import MyModificaPiano from './MyModificaPiano';
import nightModeContext from './nightModeContext';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'

import API from './API';
import { useLocation } from 'react-router-dom';
import MyLoginForm from './MyLoginForm';

function App() {

  const location = useLocation();

  let [courses, setCourses] = useState([]);
  let [piano, setPiano] = useState([]);
  let [pianoProvvisorio, setPianoProvvisorio] = useState([]); 
  const [nightMode, setNightMode] = useState(true);
  let updateNightMode = () => setNightMode(nightMode => !nightMode);
  let nightModeObject = { nightMode: nightMode, updateNightMode: updateNightMode };

  const [loadCorsiInit, setLoadCorsiInit] = useState(true);
  const [loadPianoInit, setLoadPianoInit] = useState(true);
  const [loadCorsi, setLoadCorsi] = useState(false);
  const [loadPiano, setLoadPiano] = useState(false);

  const navigate = useNavigate();

  const [loggedIn, setLoggedIn] = useState(false);  // no user is logged in when app loads
  const [user, setUser] = useState({});

  const [messageLogin, setMessageLogin] = useState('');

  let [crediti, setCrediti] = useState(0);
  let [creditiProvvisori, setCreditiProvvisori] = useState(0);

  function handleError(err) {
    console.log(err);
  }

  const updateIscrizione = (tipoIscrizione) => {
    setUser(u => {
      const newU = { ...u, iscrizione: tipoIscrizione };
      return newU;
    });
    API.storeUpdatedIscrizione({ ...user, iscrizione: tipoIscrizione })
      .then()
      .catch(err => handleError(err));
  }

  const updateIscrittiCorsi = (corsi) => {
    setCourses(corsi); 
    let arrayCorsiModificati = corsi.filter(c => c.dirty === true);
    console.log(arrayCorsiModificati)
    API.updateIscrittiCourses(arrayCorsiModificati)
      .then(setLoadCorsi(true))
      .catch(err => handleError(err));
  }

  useEffect(() => {
    if (loadCorsi || loadCorsiInit) {
      API.getCourses()
        .then((courses) => {
          setCourses(courses);
          setLoadCorsi(false);
          setLoadCorsiInit(false);
        })
        .catch(err => handleError(err));
    }
  }, [loadCorsi, loadCorsiInit]);

  const updatePiano = (piano, crediti) => {
    setPiano(piano);
    API.updatePiano(piano.map(c => '"'+c+'"'), crediti)
      .then(setLoadPiano(true))
      .catch(err => handleError(err));
  }

  useEffect(() => {
    if (loadPiano || loadPianoInit) {
      API.getPiano()
        .then((piano) => {
          setPiano(piano.corsi);
          setPianoProvvisorio(piano.corsi);
          setCrediti(piano.crediti);
          setCreditiProvvisori(piano.crediti);
          setLoadPiano(false);
          setLoadPianoInit(false);
        })
        .catch(err => handleError(err));
    }
  }, [loadPiano, loadPianoInit]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
      } catch (err) {
        handleError(err);
      }
    };
    checkAuth();
  }, []);

  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then(user => {
        setLoggedIn(true);
        setUser(user);
        setMessageLogin('');
        setLoadPianoInit(false);
        setLoadPianoInit(true);
        user.iscrizione === null ?
          navigate('/iscrizione') :
          navigate('/pianostudi');
      })
      .catch(err => {
        setMessageLogin(err);
      }
      )
  }

  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser({});
    setPiano([]);
    setMessageLogin('');
    navigate('/login');
  }

  const homePageNoAuth =
    <>
      <MyTable loadCorsiInit={loadCorsiInit} loadCorsi={loadCorsi}
        pianoProvvisorio={pianoProvvisorio} setPianoProvvisorio={setPianoProvvisorio}
        courses={courses} setCourses={setCourses} updateIscrittiCorsi={updateIscrittiCorsi}
        creditiProvvisori={creditiProvvisori} setCreditiProvvisori={setCreditiProvvisori}/>
      <MyLoginForm errorMessage={messageLogin} setErrorMessage={setMessageLogin} login={doLogIn}/>
    </>

  const homePageAuthNoIscritto =
    <>
      <MyTable loadCorsiInit={loadCorsiInit} loadCorsi={loadCorsi}
        pianoProvvisorio={pianoProvvisorio} setPianoProvvisorio={setPianoProvvisorio}
        courses={courses} setCourses={setCourses} updateIscrittiCorsi={updateIscrittiCorsi}
        creditiProvvisori={creditiProvvisori} setCreditiProvvisori={setCreditiProvvisori}/>
      <MyIscrizione user={user} updateIscrizione={updateIscrizione}/>
    </>

  const homePageAuthIscritto =
    <>
      <MyTable loadCorsiInit={loadCorsiInit} loadCorsi={loadCorsi}
        pianoProvvisorio={pianoProvvisorio} setPianoProvvisorio={setPianoProvvisorio}
        courses={courses} setCourses={setCourses} updateIscrittiCorsi={updateIscrittiCorsi}
        creditiProvvisori={creditiProvvisori} setCreditiProvvisori={setCreditiProvvisori}/>
      <MyPianoStudi user={user} piano={piano} courses={courses} 
        loadPiano={loadPiano} loadPianoInit={loadPianoInit}/>
    </>

  const editPage =
    <>
      <MyTable loadCorsiInit={loadCorsiInit} loadCorsi={loadCorsi}
        pianoProvvisorio={pianoProvvisorio} setPianoProvvisorio={setPianoProvvisorio}
        courses={courses} setCourses={setCourses} updateIscrittiCorsi={updateIscrittiCorsi}
        creditiProvvisori={creditiProvvisori} setCreditiProvvisori={setCreditiProvvisori}/>
      <MyModificaPiano pianoIniziale={piano} pianoProvvisorio={pianoProvvisorio} setPianoProvvisorio={setPianoProvvisorio}
        creditiIniziali={crediti} creditiProvvisori={creditiProvvisori} setCreditiProvvisori={setCreditiProvvisori}
        updateIscrittiCorsi={updateIscrittiCorsi}
        courses={courses} setCourses={setCourses} updatePiano={updatePiano} user={user}/>
    </>

  return (
    <nightModeContext.Provider value={nightModeObject}>
      <MyNavbar loggedIn={loggedIn} logOut={doLogOut} user={user} piano={piano} />
      <div style={{height: '11vh'}}></div>
      <Row className={nightMode ? "p-3 mb-2 bg-dark text-white min-vh-100" :
        "p-3 mb-2 bg-light text-black min-vh-100"} >

        <Routes>

        <Route path='/login' element={loggedIn ?
            (user.iscrizione === null ?
              <Navigate to='/iscrizione' /> :
              <Navigate to='/pianostudi' />
            ) :
            homePageNoAuth} />

          <Route path='/iscrizione' element={loggedIn ?
            homePageAuthNoIscritto :
            <Navigate to='/login' />} />

          <Route path='/pianostudi' element={loggedIn ? homePageAuthIscritto : <Navigate to='/login' />} />

          <Route path='/pianostudi/modifica' element={loggedIn ? editPage : <Navigate to='/login' />} />

          <Route path='/' element={<Navigate to='/pianostudi'/>} />

          <Route path='*' element={<MyNotFound />} />

        </Routes>

      </Row>
      <MyFooter />
    </nightModeContext.Provider>
  );
}

export default App;