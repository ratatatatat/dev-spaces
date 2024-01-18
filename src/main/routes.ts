import express from 'express';
import { Service } from '../Types';
import sqlite3 from 'sqlite3';

const router = express.Router();

const db = new sqlite3.Database('./services.db');

db.run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY,
    name TEXT,
    directoryPath TEXT
)`);

// GET /services
router.get('/services', (req, res) => {
  db.all('SELECT * FROM services', (err, rows) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(rows);
    }
  });
});

// POST /services
router.post('/services', (req, res) => {
    const service: Service = req.body;
    db.run('INSERT INTO services (name, directoryPath) VALUES (?, ?)', [service.name, service.directoryPath], function(err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(201).json({ id: this.lastID, ...service });
      }
    });
});

// GET /services/:id
router.get('/services/:id', (req, res) => {
  db.get('SELECT * FROM services WHERE id = ?', req.params.id, (err, row) => {
    if (err) {
      res.status(500).send(err);
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).send('Service not found');
    }
  });
});

// PUT /services/:id
router.put('/services/:id', (req, res) => {
    const service: Service = req.body;
    db.run('UPDATE services SET name = ?, directoryPath = ? WHERE id = ?', [service.name, service.directoryPath, req.params.id], function(err) {
      if (err) {
        res.status(500).send(err);
      } else if (this.changes) {
        res.json({ id: req.params.id, ...service });
      } else {
        res.status(404).send('Service not found');
      }
    });
  });

// DELETE /services/:id
router.delete('/services/:id', (req, res) => {
  db.run('DELETE FROM services WHERE id = ?', req.params.id, function(err) {
    if (err) {
      res.status(500).send(err);
    } else if (this.changes) {
      res.status(204).send();
    } else {
      res.status(404).send('Service not found');
    }
  });
});

export default router;