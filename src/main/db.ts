import sqlite3 from 'sqlite3';
import { DBService, Service } from '../Types';
import { app } from 'electron';
import path from 'path';

const dbPath = path.join(app.getPath('userData'), 'services.db');
const db = new sqlite3.Database(dbPath);

db.run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY,
    name TEXT,
    directoryPath TEXT,
    notes TEXT DEFAULT ''
)`);

db.run(`ALTER TABLE services ADD COLUMN notes TEXT DEFAULT ''`, err => {
    if (err) {
      // This will likely fail if the column already exists, so we'll catch the error and do nothing
      console.log('Notes column already exists');
    }
});


export const getAllServices = (): Promise<DBService[]> => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM services', (err, rows: DBService[]) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

export const createService = (service: Service): Promise<DBService> => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO services (name, directoryPath, notes) VALUES (?, ?, ?)', [service.name, service.directoryPath, service.notes || ''], function (err) {
            if (err) reject(err);
            else resolve({
                id: this.lastID,
                ...service,
            });
        });
    });
};

export const getServiceById = (id: number): Promise<DBService> => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM services WHERE id = ?', id, (err, row: DBService) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

export const updateService = (id: number, service: Service): Promise<DBService> => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE services SET name = ?, directoryPath = ?, notes = ? WHERE id = ?', [service.name, service.directoryPath, service.notes || '', id], function (err) {
            if (err) reject(err);
            else resolve({ ...service, id });
        });
    });
};

export const deleteService = (id: number) => {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM services WHERE id = ?', id, function (err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
};
