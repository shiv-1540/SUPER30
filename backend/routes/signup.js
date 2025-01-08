const express = require('express');
const router = express.Router();
const md5 = require('md5');
const connection = require('../database/db.js'); // Make sure you import your database connection

// Signup route
router.post('/signup', (req, res) => {
    const { username, firstname, lastname, email, password, bio } = req.body;
    const hashedPassword = md5(password);

    const checkUsernameQuery = 'SELECT username FROM users WHERE username = ?';
    connection.query(checkUsernameQuery, [username], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) return res.status(400).json({ message: 'Username already exists, use a different username.' });

        const insertUserQuery = 'INSERT INTO users (username, firstname, lastname, email, password, bio) VALUES (?, ?, ?, ?, ?, ?)';
        connection.query(insertUserQuery, [username, firstname, lastname, email, hashedPassword, bio], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'User added successfully!', userId: results.insertId });
        });
    });
});

// Login route
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required.' });

    const query = 'SELECT user_id, username, password, disabled_user, disabled_admin FROM users WHERE username = ?';
    connection.query(query, [username], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(400).json({ message: 'User not found.' });

        const user = results[0];
        if (md5(password) !== user.password) return res.status(400).json({ message: 'Incorrect password.' });
        if (user.disabled_admin) return res.status(403).json({ message: 'Account disabled by admin.' });

        if (user.disabled_user) {
            const enableUserQuery = 'UPDATE users SET disabled_user = 0 WHERE user_id = ?';
            connection.query(enableUserQuery, [user.user_id], (err, updateResults) => {
                if (err) return res.status(500).json({ error: err.message });
                res.status(200).json({ message: 'Login successful! User account re-enabled.' });
            });
        } else {
            res.status(200).json({ message: 'Login successful!' });
        }
    });
});

module.exports = router;
