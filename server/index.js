// ******************************************************************
// per simulare ritardo server durante caricamenti iniziali        **
// e durante sincronizzazioni a seguito di azioni dell'utente      **
const ritardo = 200; //valore in millisecondi                     **
// se giudicato fastidioso, può essere settato a zero              **
// ******************************************************************

const express = require('express');
const morgan = require('morgan'); // logging middleware
const dao = require('./dao'); // module for accessing the DB
const cors = require('cors');

const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const userDao = require('./user-dao');


/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function (username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Email e/o password errati.' });

      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});

const PORT = 3001;

app = new express();
app.use(morgan('dev'));
app.use(express.json());
const corsOptions = {
  origin: 'http://100.96.1.34:3000',
  credentials: true,
};
app.use(cors(corsOptions));

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated())
    return next();

  return res.status(401).json({ error: 'Utente non autenticato. Effettua il login per accedere al tuo piano.' });
}

// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 'a secret sentence not to share with anybody and anywhere, used to sign the session ID cookie',
  resave: false,
  saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());


/*** APIs ***/


// GET /corsi
app.get('/corsi', (req, res) => { //anche per i non loggedIn
  dao.listCourses()
    .then(courses => setTimeout(() => res.status(200).json(courses), ritardo)) //setto timeout per simulare latenza server
    .catch(() => res.status(500).json({ error: err.toString()+' (GET /corsi 500)' }));
});

// GET /pianostudi
app.get('/pianostudi', isLoggedIn, (req, res) => {
  dao.listPiano(req.user.id)
    .then(piano => {
      setTimeout(() => res.status(200).json(piano), ritardo);
    }) //setto timeout per simulare latenza server
    .catch(() => res.status(500).json({ error: err.toString()+' (GET /pianostudi 500)' }));
});

// PUT /pianostudi
app.put('/pianostudi', isLoggedIn, async (req, res) => {
  let invalid = false;
  let notExist = false;
  let conflictMsg = '';
  let actualCrediti = 0;
  if (Array.isArray(req.body.corsi) === false
    || req.body.crediti < 0) {
    invalid = true;
  }
  try {
    if (invalid === false) {
      for (let corsoID of req.body.corsi) {
        if (await dao.isThereCourseID(corsoID) === 0) {
          notExist = true;
        }
        let propedeutico = await dao.getPropedeutico(corsoID);
        if (propedeutico !== null) {
          if (req.body.corsi.filter(cid => cid === propedeutico).length === 0) {
            conflictMsg = 'Non sono rispettati i vincoli sulla propedeuticità dei corsi';
          }
        }
        let incompatibili = await dao.getIncompatibili(corsoID);
        if (incompatibili !== null) {
          for (let incompatibile of incompatibili) {
            if (req.body.corsi.filter(cid => cid === incompatibile).length > 0) {
              conflictMsg = 'Non sono rispettati i vincoli sulla compatibilità dei corsi';
            }
          }
        }
        let cfuSingle = await dao.getCrediti(corsoID);
        actualCrediti = actualCrediti + cfuSingle;
      }
      if (actualCrediti !== req.body.crediti) {
        conflictMsg = 'Non sono rispettati i vincoli sul numero di crediti dei corsi';
      }
      else if (req.user.iscrizione === 'part-time'
        && (actualCrediti < 20 || actualCrediti > 40) && actualCrediti !== 0) {
          conflictMsg = 'Non sono rispettati i vincoli sul numero di crediti dei corsi';
      }
      else if (req.user.iscrizione === 'full-time'
        && (actualCrediti < 60 || actualCrediti > 80) && actualCrediti !== 0) {
          conflictMsg = 'Non sono rispettati i vincoli sul numero di crediti dei corsi';
      }
    }
    if (invalid) {
      return res.status(422).json({ error: 'Formato piano studi errato (PUT /pianostudi 422)' });
    }
    if (notExist) {
      return res.status(404).json({ error: 'Uno o più corsi sono inesistenti (PUT /pianostudi 404)' });
    }
    if (conflictMsg) {
      return res.status(409).json({ error: `${conflictMsg} (PUT /pianostudi 409)` });
    }
    let oldPiano = await dao.listPiano(req.user.id);
    for(let newCourse of req.body.corsi){
      if(oldPiano.corsi.filter(c => c === newCourse).length === 0){ //corso aggiunto
        if (await dao.courseReachedMaxStudenti(newCourse) === true) {
          return res.status(409).json({ error: `Il corso ${newCourse} ha raggiunto il massimo di iscritti (PUT /pianostudi 409)` });
        }
        await dao.setIscrittiCourse(newCourse, +1);
      }
    }
    for(let oldCourse of oldPiano.corsi){
      if(req.body.corsi.filter(c => c === oldCourse).length === 0){ //corso rimosso
        await dao.setIscrittiCourse(oldCourse, -1);
      }
    }
    await dao.setPiano(req.body.corsi, req.body.crediti, req.user.id);
    res.status(200).end();
  } catch (err) {
    res.status(500).json({ error: err.toString()+' (POST /pianostudi 500)' });
  }
});

// PUT /iscrizione
app.put('/iscrizione', isLoggedIn, async (req, res) => {
  if (req.body.iscrizione !== 'part-time'
    && req.body.iscrizione !== 'full-time'
    && req.body.iscrizione !== null) {
    return res.status(422).json({ error: 'Tipo di iscrizione invalido (PUT /iscrizione 422)' });
  }
  try {
    await dao.updateIscrizione(req.body.iscrizione, req.user.id);
    res.status(200).end();
  } catch (err) {
    res.status(500).json({ error: err.toString()+' (PUT /iscrizione 500)' });
  }
});


/*** Users APIs ***/

// POST /sessions 
// login
app.post('/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err)
        return next(err);

      // req.user contains the authenticated user, we send all the user info back
      // this is coming from userDao.getUser()
      return res.json(req.user);
    });
  })(req, res, next);
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else
    res.status(401).json({ error: 'Utente non autenticato. Effettua il login per accedere al tuo piano.' });;
});

// DELETE /sessions/current 
// logout
app.delete('/sessions/current', (req, res) => {
  req.logout(() => { res.end(); });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));
