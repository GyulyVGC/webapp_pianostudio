import 'bootstrap/dist/css/bootstrap.min.css';
import { Row } from 'react-bootstrap';
import './App.css';
import React, { useEffect, useState } from 'react';
import MyNavbar from './MyNavbar.js';
import MyFilters from './MyFilters.js';
import MyTable from './MyTable.js';
import MyFooter from './MyFooter.js';
import MyForm from './MyForm';
import MyNotFound from './MyNotFound';
import MyIscrizione from './MyIscrizione';
import MyPianoStudi from './MyPianoStudi';
import MyModificaPiano from './MyModificaPiano';
import MyAlerts from './MyAlerts';
import nightModeContext from './nightModeContext';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'

import API from './API';
import { useLocation } from 'react-router-dom';
import MyLoginForm from './MyLoginForm';
/*
let pathToSelector = {
  '/': 'All',
  '/films': 'All',
  '/films/favorites': 'Favorites',
  '/films/bestRated': 'Best rated',
  '/films/seenLastMonth': 'Seen last month',
  '/films/unseen': 'Unseen',
};
*/
function App() {

  const location = useLocation();

  let [courses, setCourses] = useState([]);
  let [piano, setPiano] = useState([]);
  let [pianoProvvisorio, setPianoProvvisorio] = useState([]); 
  const [nightMode, setNightMode] = useState(true);
  let updateNightMode = () => setNightMode(nightMode => !nightMode);
  let nightModeObject = { nightMode: nightMode, updateNightMode: updateNightMode };

  const [loadCorsiInit, setLoadCorsiInit] = useState(true);
  //const [loadPianoInit, setLoadPianoInit] = useState(true);
  const [loadPiano, setLoadPiano] = useState(true);
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

  const updatePiano = (piano, crediti) => {
    setPiano(piano);
    API.updatePiano(piano.map(c => '"'+c+'"'), crediti)
      .then(setLoadPiano(true))
      .catch(err => handleError(err));
  }

  useEffect(() => {
    if (loadCorsiInit) {
      API.getCourses()
        .then((courses) => {
          setCourses(courses);
          setLoadCorsiInit(false);
        })
        .catch(err => handleError(err));
    }
  }, [loadCorsiInit]);

  useEffect(() => {
    if (loadPiano) {
      API.getPiano()
        .then((piano) => {
          setPiano(piano.corsi);
          setPianoProvvisorio(piano.corsi);
          setCrediti(piano.crediti);
          setCreditiProvvisori(piano.crediti);
          setLoadPiano(false);
        })
        .catch(err => handleError(err));
    }
  }, [loadPiano]);

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

  /*
    let addFilm = (film) => {
      film.status = 'updated';
      setFilms(oldFilms => oldFilms.concat(film));
      API.addFilm(film)
        .then(() => setDirty(true))
        .catch(err => handleError(err));
    }
  */
  /*
    let updateFilm = (film) => {
      const oldFilm = films.filter(f => f.id === film.id)[0];
      let updateBackend = false;
      if (oldFilm.title !== film.title
        || oldFilm.favorite !== film.favorite
        || oldFilm.rating !== film.rating
        || oldFilm.date !== film.date) {
        film.status = 'updated';
        updateBackend = true;
      }
      setFilms(films => films.map(
        f => (f.id === film.id) ? Object.assign({}, film) : f
      ));
      if (updateBackend) {
        API.updateFilm(film)
          .then(() => setDirty(true))
          .catch(err => handleError(err));
      }
    }
  
    let deleteFilm = (film) => {
      film.status = 'updated';
      API.deleteFilm(film.id)
        .then(() => setDirty(true))
        .catch(err => handleError(err));
    }
  
  */

  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then(user => {
        setLoggedIn(true);
        setUser(user);
        setMessageLogin('');
        setLoadPiano(false);
        setLoadPiano(true);
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
  /*
    const myAppBody = <> <MyFilters setInitialLoading={setInitialLoading} setDirty={setDirty} selettore={selettore} changeSelettore={changeSelettore} />
      <MyTable initialLoading={initialLoading} films={films} selettore={selettore}
        deleteFilm={deleteFilm} updateFilm={updateFilm} /></>;
  */

  const homePageNoAuth =
    <>
      <MyTable loadCorsiInit={loadCorsiInit} pianoProvvisorio={pianoProvvisorio} setPianoProvvisorio={setPianoProvvisorio}
        courses={courses} setCourses={setCourses}
        creditiProvvisori={creditiProvvisori} setCreditiProvvisori={setCreditiProvvisori}/>
      <MyLoginForm errorMessage={messageLogin} setErrorMessage={setMessageLogin} login={doLogIn}/>
    </>

  const homePageAuthNoIscritto =
    <>
      <MyTable loadCorsiInit={loadCorsiInit} pianoProvvisorio={pianoProvvisorio} setPianoProvvisorio={setPianoProvvisorio}
        courses={courses} setCourses={setCourses}
        creditiProvvisori={creditiProvvisori} setCreditiProvvisori={setCreditiProvvisori}/>
      <MyIscrizione user={user} updateIscrizione={updateIscrizione}/>
    </>

  const homePageAuthIscritto =
    <>
      <MyTable loadCorsiInit={loadCorsiInit} pianoProvvisorio={pianoProvvisorio} setPianoProvvisorio={setPianoProvvisorio}
        courses={courses} setCourses={setCourses}
        creditiProvvisori={creditiProvvisori} setCreditiProvvisori={setCreditiProvvisori}/>
      <MyPianoStudi user={user} piano={piano} courses={courses} loadPiano={loadPiano}/>
    </>

  const editPage =
    <>
      <MyTable loadCorsiInit={loadCorsiInit} pianoProvvisorio={pianoProvvisorio} setPianoProvvisorio={setPianoProvvisorio}
        courses={courses} setCourses={setCourses}
        creditiProvvisori={creditiProvvisori} setCreditiProvvisori={setCreditiProvvisori}/>
      <MyModificaPiano pianoIniziale={piano} pianoProvvisorio={pianoProvvisorio} setPianoProvvisorio={setPianoProvvisorio}
        creditiIniziali={crediti} creditiProvvisori={creditiProvvisori} setCreditiProvvisori={setCreditiProvvisori}
        courses={courses} setCourses={setCourses} updatePiano={updatePiano} user={user}/>
    </>

  return (
    <nightModeContext.Provider value={nightModeObject}>
      <MyNavbar loggedIn={loggedIn} logOut={doLogOut} user={user} />
      <br /><br /><br />
      <Row className={nightMode ? "p-3 mb-2 bg-dark text-white min-vh-100" :
        "p-3 mb-2 bg-light text-black min-vh-100"} >

        <Routes>

          <Route path='/' element={loggedIn ?
            homePageAuthNoIscritto :
            <Navigate to='/login' />} />

          <Route path='/login' element={loggedIn ?
            (user.iscrizione === null ?
              <Navigate to='/iscrizione' /> :
              <Navigate to='/pianostudi' />
            ) :
            homePageNoAuth} />

          <Route path='/pianostudi' element={loggedIn ? homePageAuthIscritto : <Navigate to='/login' />} />

          <Route path='/pianostudi/modifica' element={loggedIn ? editPage : <Navigate to='/login' />} />

          {/*
          <Route path='/films' element={loggedIn ? myAppBody : <Navigate to='/login' />} />

          <Route path='/add' element={loggedIn ? <MyForm changeSelettore={changeSelettore} addOrEdit={addFilm} films={films} /> : <Navigate to='/login' />} />

          <Route path='/edit/:iD' element={loggedIn ? <MyForm changeSelettore={changeSelettore} addOrEdit={updateFilm} films={films} /> : <Navigate to='/login' />} />

          <Route path='*' element={<MyNotFound />} />
          */}

        </Routes>

      </Row>
      <MyFooter />
    </nightModeContext.Provider>
  );
}

export default App;