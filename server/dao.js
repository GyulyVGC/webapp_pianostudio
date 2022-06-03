'use strict';
const dayjs = require('dayjs');
/* Data Access Object (DAO) module for accessing courses and exams */

const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database('pianostudi.db', (err) => {
    if (err) throw err;
});

// get all courses
exports.listCourses = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM CORSO';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const courses = rows.map((c) => ({
                codice: c.CODICE,
                nome: c.NOME,
                crediti: c.CREDITI,
                maxstudenti: c.MAXSTUDENTI,
                iscritti: c.ISCRITTI,
                incompatibili: JSON.parse(c.INCOMPATIBILI),
                propedeutico: c.PROPEDEUTICO
            }));
            resolve(courses);
        });
    });
};

// get corse by codice
exports.getCourseByCodice = (codice) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM CORSO WHERE CODICE = ?';
        db.all(sql, [id], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const corso = rows.map((f) => ({
                codice: c.CODICE,
                nome: c.NOME,
                crediti: c.CREDITI,
                maxstudenti: c.MAXSTUDENTI,
                iscritti: c.ISCRITTI,
                incompatibili: JSON.parse(c.INCOMPATIBILI),
                propedeutico: c.PROPEDEUTICO
            }))[0];
            resolve(corso);
        });
    });
};

exports.insertFilm = (title, favorite, watchdate, rating, userID) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO films(title, favorite, watchdate, rating, user) VALUES(?,?,?,?,?)';
        db.run(sql, [title, favorite, watchdate, rating, userID], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
};

// update piano di studi
exports.setPiano = (corsi, userID) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE ISCRIZIONE SET CORSI=? WHERE IDUSER = ?';
        db.run(sql, [corsi, userID], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
};

// delete an existing film
exports.deleteFilm = (id, userID) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM films WHERE id = ? AND user=?';
        db.run(sql, [id, userID], (err) => {
            if (err) {
                reject(err);
                return;
            } else
                resolve(null);
        });
    });
}