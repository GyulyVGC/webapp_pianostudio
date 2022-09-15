'use strict';
/* Data Access Object (DAO) module for accessing courses and exams */

const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database('pianostudi.db', (err) => {
    if (err) throw err;
});

//controlla se l'id del corso esiste
exports.isThereCourseID = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT COUNT(*) AS N FROM CORSO WHERE ID = ?';
        db.all(sql, [id], (err, rows) => {
            if (err) {
                reject(err); return;
            }
            resolve(rows[0].N);
        });
    });
}

//controlla se il corso ha raggiunto il massimo di iscritti
//utile saperlo per i casi in cui due o più utenti modificano in contemporanea
//controllo fatto su lato client, ma effettuato anche lato server per completezza
exports.courseReachedMaxStudenti = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT ISCRITTI, MAXSTUDENTI FROM CORSO WHERE ID = ?';
        db.all(sql, [id], (err, rows) => {
            if (err) {
                reject(err); return;
            }
            resolve(rows[0].ISCRITTI === rows[0].MAXSTUDENTI ? true : false);
        });
    });
}

//restituisce corso propedeutico, usato per validazione di piano studi sottomesso
//controllo fatto su lato client, ma effettuato anche lato server per completezza
exports.getPropedeutico = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT PROPEDEUTICO FROM CORSO WHERE ID = ?';
        db.all(sql, [id], (err, rows) => {
            if (err) {
                reject(err); return;
            }
            resolve(rows[0].PROPEDEUTICO);
        });
    });
}

//restituisce corsi incompatibili, usato per validazione di piano studi sottomesso
//controllo fatto su lato client, ma effettuato anche lato server per completezza
exports.getIncompatibili = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT INCOMPATIBILI FROM CORSO WHERE ID = ?';
        db.all(sql, [id], (err, rows) => {
            if (err) {
                reject(err); return;
            }
            resolve(rows[0].INCOMPATIBILI);
        });
    });
}

//restituisce crediti del corso, usato per validazione di piano studi sottomesso
//controllo fatto su lato client, ma effettuato anche lato server per completezza
exports.getCrediti = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT CREDITI FROM CORSO WHERE ID = ?';
        db.all(sql, [id], (err, rows) => {
            if (err) {
                reject(err); return;
            }
            resolve(rows[0].CREDITI);
        });
    });
}

// get tutti corsi
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
exports.setIscrittiCourse = (corsoModificato, addedOrRemoved) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE CORSO SET ISCRITTI=ISCRITTI+? WHERE ID = ?';
        db.run(sql, [addedOrRemoved, corsoModificato], function (err) {
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