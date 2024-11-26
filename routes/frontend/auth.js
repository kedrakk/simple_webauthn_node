const express = require('express');
const router = express.Router();
const UserModel = require('../../model/userModel.js');
const { generateRegistrationOptions } = require('@simplewebauthn/server');
const mongoose = require('mongoose');

const rpName = 'SimpleWebAuthn Example';
const rpID = 'localhost';//'simple-webauthn.onrender.com';//'localhost';
const origin = 'https://simple-webauthn.onrender.com';//`http://${rpID}:${port}`;
const expectedOrigin = 'https://simple-webauthn.onrender.com';//`http://${rpID}:${port}`;

router.get('/login', (req, res) => {
    res.render('layout', { title: 'Login', view: `login` });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    // Handle login logic here
    res.send('Login submitted!');
});

router.get('/generate-registration-options', async (req, res) => {

    const mongooseUser = await UserModel.findOne({ email: userEmail });
    const user = {
        id: mongooseUser.userId,
        username: mongooseUser.username,
        email: mongooseUser.email,
        devices: [],
    };

    let opts = {
        rpName: rpName,
        rpID,
        userName: user.username,
        timeout: 60000,
        attestationType: 'none',
        excludeCredentials: user.devices.map((dev) => ({
            id: dev.credentialID,
            type: 'public-key',
            transports: dev.transports,
        })),
        authenticatorSelection: {
            residentKey: 'discouraged',
            userVerification: 'preferred',
        },
        supportedAlgorithmIDs: [-7, -257], //Support the two most common algorithms: ES256, and RS256
    }

    const options = await generateRegistrationOptions(opts);
    req.session.currentChallenge = options.challenge;
    req.session.webAuthnUserID = options.user.id;
    res.send(options);
});

module.exports = router;
