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

  //const [initialLoading, setInitialLoading] = useState(true);
  const [dirty, setDirty] = useState(true);
  const navigate = useNavigate();

  const [loggedIn, setLoggedIn] = useState(false);  // no user is logged in when app loads
  const [user, setUser] = useState({});

  const [messageLogin, setMessageLogin] = useState('');

  let [crediti, setCrediti] = useState(0);

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

  const updatePiano = () => {
    setPiano(pianoProvvisorio);
    API.updatePiano(pianoProvvisorio)
      .then(setDirty(true))
      .catch(err => handleError(err));
  }

  useEffect(() => {
    if (dirty) {
      API.getCourses()
        .then((courses) => {
          setCourses(courses);
          setDirty(false);
        })
        .catch(err => handleError(err));
    }
  }, [dirty]);

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
        user.iscrizione === null ?
          navigate('/iscrizione') :
          navigate('/pianoStudi');
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
      <MyTable dirty={dirty} courses={courses} pianoProvvisorio={pianoProvvisorio} setPianoProvvisorio={setPianoProvvisorio}
        crediti={crediti} setCrediti={setCrediti}/>
      <MyLoginForm errorMessage={messageLogin} setErrorMessage={setMessageLogin} login={doLogIn}/>
    </>

  const homePageAuthNoIscritto =
    <>
      <MyTable dirty={dirty} courses={courses} pianoProvvisorio={pianoProvvisorio} setPianoProvvisorio={setPianoProvvisorio}
        crediti={crediti} setCrediti={setCrediti}/>
      <MyIscrizione user={user} updateIscrizione={updateIscrizione}/>
    </>

  const homePageAuthIscritto =
    <>
      <MyTable dirty={dirty} courses={courses} pianoProvvisorio={pianoProvvisorio} setPianoProvvisorio={setPianoProvvisorio}
        crediti={crediti} setCrediti={setCrediti}/>
      <MyPianoStudi user={user} piano={piano} />
    </>

  const editPage =
    <>
      <MyTable dirty={dirty} courses={courses} pianoProvvisorio={pianoProvvisorio} setPianoProvvisorio={setPianoProvvisorio}
        crediti={crediti} setCrediti={setCrediti}/>
      <MyModificaPiano user={user} pianoProvvisorio={pianoProvvisorio} setPianoProvvisorio={setPianoProvvisorio}
        crediti={crediti} setCrediti={setCrediti} courses={courses} updatePiano={updatePiano}/>
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
              <Navigate to='/pianoStudi' />
            ) :
            homePageNoAuth} />

          <Route path='/pianoStudi' element={loggedIn ? homePageAuthIscritto : <Navigate to='/login' />} />

          <Route path='/pianoStudi/modifica' element={loggedIn ? editPage : <Navigate to='/login' />} />

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