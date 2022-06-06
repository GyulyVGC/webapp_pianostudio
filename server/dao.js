'use strict';
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
                id: c.ID,
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

// update iscritti ai corsi
exports.setIscrittiCourse = (corsoModificato) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE CORSO SET ISCRITTI=? WHERE CODICE = ?';
        db.run(sql, [corsoModificato.iscritti, corsoModificato.codice], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
};

// tutti i corsi del piano dello user loggato
exports.listPiano = (userID) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM ISCRIZIONE WHERE IDUSER=?';
        db.all(sql, [userID], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const piano = rows.map((c) => ({
                corsi: JSON.parse(c.CORSI),
                crediti: c.CREDITI
            }));
            resolve(piano[0]);
        });
    });
};

// update piano di studi
exports.setPiano = (corsi, crediti, userID) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE ISCRIZIONE SET CORSI=?, CREDITI=? WHERE IDUSER = ?';
        db.run(sql, [corsi === null ? null : '[' + corsi + ']', crediti, userID], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
};

exports.updateIscrizione = (tipoIscrizione, id) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE USER SET iscrizione=? WHERE id = ?';
        db.run(sql, [tipoIscrizione, id], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
}