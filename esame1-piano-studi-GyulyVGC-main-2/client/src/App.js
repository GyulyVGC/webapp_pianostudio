import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Row } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'

import API from './API';
import MyTable from './MyTable.js';
import MyFooter from './MyFooter.js';
import MyNavbar from './MyNavbar.js';
import MyNotFound from './MyNotFound';
import MyLoginForm from './MyLoginForm';
import MyIscrizione from './MyIscrizione';
import MyPianoStudi from './MyPianoStudi';
import nightModeContext from './nightModeContext';

function App() {

  const [courses, setCourses] = useState([]);
  const [loadCorsi, setLoadCorsi] = useState(false);
  const [loadCorsiInit, setLoadCorsiInit] = useState(true);

  const [piano, setPiano] = useState([]);
  const [loadPiano, setLoadPiano] = useState(false);
  const [loadPianoInit, setLoadPianoInit] = useState(true);
  const [pianoProvvisorio, setPianoProvvisorio] = useState([]);

  const [crediti, setCrediti] = useState(0);
  const [creditiProvvisori, setCreditiProvvisori] = useState(0);

  const [nightMode, setNightMode] = useState(true);
  const updateNightMode = () => setNightMode(nightMode => !nightMode);
  const nightModeObject = { nightMode: nightMode, updateNightMode: updateNightMode };

  const [user, setUser] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);

  const [serverError, setServerError] = useState('');
  const [messageLogin, setMessageLogin] = useState('');

  //usato per non permettere all'utente di premere bottoni
  //mentre è in corso la verifica di conflitti a causa di modifiche 
  //contemporanee di più utenti
  const [verifying, setVerifying] =useState(false);

  const navigate = useNavigate();

  const updateCourses = (courses) => {
    setCourses(courses);
  }

  const updateLoadCorsi = () => {
    setLoadCorsi(true);
  }

  const updatePianoProvvisorio = (pianoProvvisorio) => {
    setPianoProvvisorio(pianoProvvisorio);
  }

  const updateCreditiProvvisori = (crediti) => {
    setCreditiProvvisori(crediti);
  }

  const updateIscrizione = (tipoIscrizione) => {
    setUser(u => {
      const newU = { ...u, iscrizione: tipoIscrizione };
      return newU;
    });
    API.storeUpdatedIscrizione({ ...user, iscrizione: tipoIscrizione })
      .then()
      .catch(err => handleServerError(err));
  }

  function handleServerError(errObj) {
    setServerError(errObj.error);
  }

  useEffect(() => {
    if (loadCorsi || loadCorsiInit) {
      API.getCourses()
        .then((courses) => {
          setCourses(courses);
          setLoadCorsi(false);
          setLoadCorsiInit(false);
        })
        .catch(err => handleServerError(err));
    }
  }, [loadCorsi, loadCorsiInit]);

  const updatePiano = (piano, crediti) => {
    setPiano(piano);
    API.updatePiano(piano, crediti)
      .then(() => {
        setLoadPiano(true);
        setLoadCorsi(true);
      })
      .catch(err => handleServerError(err));
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
        .catch(err => handleServerError(err));
    }
  }, [loadPiano, loadPianoInit, loggedIn]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
      } catch (err) {
        handleServerError(err);
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
        setServerError('');
        setLoadPianoInit(true);
        setLoadCorsi(true);
        user.iscrizione === null ?
          navigate('/iscrizione') :
          navigate('/pianostudi');
      })
      .catch(err => {
        setMessageLogin(err);
      })
  }

  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser({});
    setPiano([]);
    setMessageLogin('');
    setLoadCorsi(true);
    navigate('/login');
  }

  const tableWithProps =
    <MyTable loadCorsiInit={loadCorsiInit} loadCorsi={loadCorsi}
      serverError={serverError} setServerError={setServerError} verifying={verifying}
      pianoProvvisorio={pianoProvvisorio} setPianoProvvisorio={updatePianoProvvisorio}
      courses={courses} setCourses={updateCourses}
      creditiProvvisori={creditiProvvisori} setCreditiProvvisori={updateCreditiProvvisori} />


  const homePageNoAuth =
    <>
      {tableWithProps}
      <MyLoginForm errorMessage={messageLogin} setErrorMessage={setMessageLogin} login={doLogIn} />
    </>

  const homePageAuthNoIscritto =
    <>
      {tableWithProps}
      <MyIscrizione user={user} updateIscrizione={updateIscrizione} />
    </>

  const homePageAuthIscritto =
    <>
      {tableWithProps}
      <MyPianoStudi pianoIniziale={piano} pianoProvvisorio={pianoProvvisorio} setPianoProvvisorio={updatePianoProvvisorio}
        creditiIniziali={crediti} creditiProvvisori={creditiProvvisori} setCreditiProvvisori={updateCreditiProvvisori}
        loadCorsi={loadCorsi} setVerifying={setVerifying} verifying={verifying}
        courses={courses} setCourses={updateCourses} updatePiano={updatePiano} user={user}
        loadPiano={loadPiano} loadPianoInit={loadPianoInit} setLoadCorsi={updateLoadCorsi}
        updateIscrizione={updateIscrizione} />
    </>

  return (
    <nightModeContext.Provider value={nightModeObject}>
      <MyNavbar loggedIn={loggedIn} logOut={doLogOut} user={user} piano={piano} />
      <div style={{ height: '11vh' }}></div>
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

          <Route path='/pianostudi' element={loggedIn ?
            homePageAuthIscritto :
            <Navigate to='/login' />} />

          <Route path='/pianostudi/modifica' element={loggedIn ?
            homePageAuthIscritto :
            <Navigate to='/login' />} />

          <Route path='/' element={<Navigate to='/pianostudi' />} />

          <Route path='*' element={<MyNotFound />} />

        </Routes>

      </Row>
      <MyFooter />
    </nightModeContext.Provider>
  );
}

export default App;