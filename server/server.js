const express = require('express');
const morgan = require('morgan'); // logging middleware
const { check, validationResult } = require('express-validator'); // validation middleware
const dao = require('./dao'); // module for accessing the DB
const cors = require('cors');
const dayjs = require("dayjs");

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
  origin: 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions));

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated())
    return next();

  return res.status(401).json({ error: 'not authenticated' });
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


// GET /courses
app.get('/courses', (req, res) => { //anche per i non loggedIn
  dao.listCourses()
    .then(courses => setTimeout(() => res.status(200).json(courses), 500)) //setto timeout per simulare latenza server
    .catch(() => res.status(500).end());
});

// GET /courses/:codice
app.get('/courses/:codice',
  async (req, res) => {
    if (isNaN(req.params.codice)) {
      return res.status(422).json();
    }
    try {
      const corso = await dao.getCourseByCodice(req.params.codice);
      if (Object.entries(corso).length === 0)
        res.status(404).json(corso);
      else
        res.json(corso);
    } catch (err) {
      res.status(500).end();
    }
  });

// PUT /pianostudi
app.put('/pianostudi', isLoggedIn, async (req, res) => {
  if (req.body.corsi !== null && Array.isArray(req.body.corsi) === false) {
    return res.status(422).json({ error: 'formato corsi errato' });
  }

  try {
    await dao.setPiano(req.body.corsi, req.user.id);
    res.status(201).end();
  } catch (err) {
    res.status(500).json();
  }
});

// DELETE /films/:id
app.delete('/films/:id', isLoggedIn, async (req, res) => {
  if (isNaN(req.params.id)) {
    return res.status(422).json();
  }
  try {
    const film = await dao.getFilmById(req.params.id, req.user.id);
    if (Object.entries(film).length === 0)
      return res.status(404).json();
    await dao.deleteFilm(req.params.id, req.user.id);
    res.status(204).end();
  } catch (err) {
    res.status(503).json({ error: `Database error during the deletion of exam ${req.params.code}.` });
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

// PUT /sessions/current
app.put('/sessions/current', isLoggedIn, async (req, res) => {
  if (req.body.iscrizione !== null
      && req.body.iscrizione !== 'part-time'
      && req.body.iscrizione !== 'full-time') {
    return res.status(422).json();
  }

  try {
    await userDao.updateIscrizione(req.body.iscrizione, req.user.id);
    res.status(200).end();
  } catch (err) {
    res.status(500).json();
  }
});


// DELETE /sessions/current 
// logout
app.delete('/sessions/current', (req, res) => {
  req.logout(() => { res.end(); });
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else
    res.status(401).json({ error: 'Unauthenticated user!' });;
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));