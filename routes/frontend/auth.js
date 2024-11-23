const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
    res.render('layout', { title: 'Login', view: `login` });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    // Handle login logic here
    res.send('Login submitted!');
});

module.exports = router;
