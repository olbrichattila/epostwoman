const path = require("path");
const sqlite3 = require("sqlite3");
const { app } = require("electron");

let db;

const OpenDatabase = () => {
    const databasePath = path.join(app.getPath("userData"), "postwoman.db");
    db = new sqlite3.Database(databasePath);
    db.run(`CREATE TABLE IF NOT EXISTS collections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            collection TEXT
        )`);
}

const CloseDatabase = () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database', err);
        } else {
            console.log('Database closed successfully');
        }
    });
}

const SaveCollection = (collectionName, data, callback) => {
    db.run(`
        INSERT INTO collections (name, collection)
        VALUES (?, ?)
        ON CONFLICT (name) DO UPDATE SET collection = excluded.collection`,
        [collectionName, data],
        (err) => {
            if (!err && callback) {
                callback()
            }
        }
     );
}

const LoadCollection = (collectionName, callback) => {
    const query = `SELECT * FROM collections WHERE name = ?`;

    db.get(query, [collectionName], (err, row) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, row);
    });
}

const GetCollections = (callback) => {
    const query = `SELECT name FROM collections ORDER BY name`;

    db.all(query, [], (err, rows) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, rows.map(item => item.name));
    });
}

const DeleteCollection = (name, callback) => {
    const query = `DELETE FROM collections where name = ?`;
    db.run(query, [name], (err) => {
        if (!err) {
            callback()
        }
    });
}

module.exports = {
    OpenDatabase,
    CloseDatabase,
    SaveCollection,
    LoadCollection,
    GetCollections,
    DeleteCollection
  };