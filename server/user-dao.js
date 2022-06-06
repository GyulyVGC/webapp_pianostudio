'use strict';
/* Data Access Object (DAO) module for accessing users */

const sqlite = require('sqlite3');
const crypto = require('crypto');

// open the database
const db = new sqlite.Database('pianostudi.db', (err) => {
    if(err) throw err;
  });

exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM USER WHERE id = ?';
      db.get(sql, [id], (err, row) => {
        if (err) 
          reject(err);
        else if (row === undefined)
          resolve({error: 'User not found.'});
        else {
          // by default, the local strategy looks for "username": not to create confusion in server.js, we can create an object with that property
          const user = {
            id: row.id, 
            username: row.email, 
            name: row.name,
            iscrizione: row.iscrizione
          }
          resolve(user);
        }
    });
  });
};

exports.getUser = (email, password) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM USER WHERE email = ?';
      db.get(sql, [email], (err, row) => {
        if (err) { reject(err); }
        else if (row === undefined) { resolve(false); }
        else {
          const user = {
            id: row.id, 
            username: row.email,
            name: row.name,
            iscrizione: row.iscrizione
          };
          
          const salt = row.salt;
          crypto.scrypt(password, salt, 32, (err, hashedPassword) => {
            if (err) reject(err);

            const hashHexDB = Buffer.from(row.hash, 'hex');

            if(!crypto.timingSafeEqual(hashHexDB, hashedPassword))
              resolve(false);
            else resolve(user); 
          });
        }
      });
    });
  };