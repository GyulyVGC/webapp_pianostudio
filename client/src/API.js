const dayjs = require("dayjs");
const URL = 'http://localhost:3001'

async function getCourses() {
  // call: GET /courses
  const response = await fetch(URL + '/courses', { credentials: 'include' }); //togliere????
  const coursesJson = await response.json();
  if (response.ok) {
    return coursesJson.map((c) => ({
      codice: c.codice,
      nome: c.nome,
      crediti: c.crediti,
      maxstudenti: c.maxstudenti,
      iscritti: c.iscritti,
      incompatibili: c.incompatibili,
      propedeutico: c.propedeutico
    })).sort((a,b) => (a.nome > b.nome) ? 1 : ((b.nome > a.nome) ? -1 : 0));
  }
  else {
    throw coursesJson;  // mi aspetto che sia un oggetto json fornito dal server che contiene l'errore
  }
}

function updateIscrittiCourses(corsiModificati) {
  // call: PUT /courses
  return new Promise((resolve, reject) => {
    fetch(URL + '/courses', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(corsiModificati)
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((obj) => { reject(obj); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

async function getPiano() {
  // call: GET /pianostudi
  const response = await fetch(URL + '/pianostudi', { credentials: 'include' });
  const pianoJson = await response.json();
  if (response.ok) {
    return pianoJson; //ha i corsi del piano e i rispettivi crediti
  }
  else {
    throw pianoJson;  // mi aspetto che sia un oggetto json fornito dal server che contiene l'errore
  }
}


function updatePiano(corsi, crediti) {
  // call: PUT /pianostudi
  return new Promise((resolve, reject) => {
    fetch(URL + '/pianostudi', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ corsi: corsi, crediti: crediti})
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((obj) => { reject(obj); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

function deleteFilm(id) {
  // call: DELETE /films/:id
  return new Promise((resolve, reject) => {
    fetch(URL + '/films/' + id, {
      method: 'DELETE',
      credentials: 'include'
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}



function storeUpdatedIscrizione(user) {
  // call: PUT /sessions/current
  return new Promise((resolve, reject) => {
    fetch(URL + '/sessions/current', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ iscrizione: user.iscrizione })
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((obj) => { reject(obj); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}





async function logIn(credentials) {
  let response = await fetch(URL + '/sessions', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetail = await response.json();
    throw errDetail.message;
  }
}

async function logOut() {
  await fetch(URL + '/sessions/current', { method: 'DELETE', credentials: 'include' });
}

async function getUserInfo() {
  const response = await fetch(URL + '/sessions/current', { credentials: 'include' });
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;  // an object with the error coming from the server
  }
}


const API = { getCourses, updateIscrittiCourses, storeUpdatedIscrizione, updatePiano, getPiano, logIn, logOut, getUserInfo };
export default API;