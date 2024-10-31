require('dotenv').config();

const express = require('express');
const session = require('express-session');
const { generateRegistrationOptions,
    verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } = require('@simplewebauthn/server');
const mongoose = require('mongoose');
const UserModel = require('./model/userModel');
const PassKeyModel = require('./model/passKeyModel');
const { userRoutes } = require('./routes/userRoutes');
const { passkeyRoutes } = require('./routes/passKeysRoutes');

const app = express();

const port = process.env.PORT || 3000;
const mongoDBURL = process.env.MongoDBURL;

app.use(express.json());
app.use(
    session({
        secret: 'secret123',
        saveUninitialized: true,
        resave: false,
        cookie: {
            maxAge: 86400000,
            httpOnly: true, // Ensure to not expose session cookies to clientside scripts
        },
    }),
);

app.use('/users', userRoutes);
app.use('/pass-keys', passkeyRoutes);

const rpName = 'SimpleWebAuthn Example';
const rpID = 'simple-webauthn.onrender.com';//'localhost';
const origin = 'https://simple-webauthn.onrender.com';//`http://${rpID}:${port}`;
const expectedOrigin = 'https://simple-webauthn.onrender.com';//`http://${rpID}:${port}`;
const userId = 123;
const userEmail = "testuser1@gmail.com";

app.get('/generate-registration-options', async (req, res) => {

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

app.post('/verify-registration', async (req, res) => {

    const body = req.body;
    const mongooseUser = await UserModel.findOne({ email: userEmail });
    const user = {
        id: mongooseUser.userId,
        username: mongooseUser.username,
        email: mongooseUser.email,
        devices: mongooseUser.devices,
    };
    const expectedChallenge = req.session.currentChallenge;
    let verification;
    try {
        const opts = {
            response: body,
            expectedChallenge: `${expectedChallenge}`,
            expectedOrigin,
            expectedRPID: rpID,
            requireUserVerification: false,
        };
        verification = await verifyRegistrationResponse(opts);
    } catch (error) {
        const _error = error;
        console.error(_error);
        return res.status(400).send({ error: _error.message });
    }
    const { verified, registrationInfo } = verification;
    if (verified && registrationInfo) {
        const { credentialPublicKey, credentialID, counter } = registrationInfo;
        const existingDevice = user.devices.find((device) => device.credentialID === credentialID);
        if (!existingDevice) {
            const newDevice = {
                credentialPublicKey,
                credentialID,
                counter,
                transports: body.response.transports,
            };
            user.devices.push(newDevice);
        }

        //!Update user info
        const authUserToUpdate = {
            id: user.id,
            userName: user.username,
            devices: user.devices
        };
        await UserModel.findOneAndUpdate({ id: user.id }, authUserToUpdate);
        console.log("User updated");

        //!Update passkey
        const webAuthnUserID = req.session.webAuthnUserID;
        const passKeyToAdd = {
            id: credentialID,
            publicKey: credentialPublicKey,
            userId: user.id,
            webauthnUserID: webAuthnUserID,
            counter: counter,
            deviceType: registrationInfo.credentialDeviceType,
            backedUp: registrationInfo.credentialBackedUp,
            devices: body.response.transports
        };
        await PassKeyModel.create(passKeyToAdd);
        console.log("Pass Key created");

    }
    req.session.currentChallenge = undefined;
    req.session.webAuthnUserID = undefined;
    res.send({ verified });
});

app.get('/generate-authentication-options', async (req, res) => {
    const mongooseUser = await UserModel.findOne({ email: userEmail });
    const user = {
        id: mongooseUser.userId,
        username: mongooseUser.username,
        email: mongooseUser.email,
        devices: mongooseUser.devices,
    };
    // const passkeysById = await PassKeyModel.PassKeyModel.find({ userId: userId });

    const opts = {
        timeout: 60000,
        allowCredentials: user.devices.map((dev) => ({
            id: dev.credentialID,
            type: 'public-key',
            transports: dev.transports,
        })),
        userVerification: 'preferred',
        rpID,
    };

    const options = await generateAuthenticationOptions(opts);
    req.session.currentChallenge = options.challenge;
    res.send(options);
});

app.post('/verify-authentication', async (req, res) => {
    const body = req.body;
    const mongooseUser = await UserModel.findOne({ email: userEmail });
    const user = {
        id: mongooseUser.userId,
        username: mongooseUser.username,
        email: mongooseUser.email,
        devices: mongooseUser.devices,
    };
    const expectedChallenge = req.session.currentChallenge;

    let dbAuthenticator;
    for (const dev of user.devices) {
        if (dev.credentialID === body.id) {
            const tempPublicKey = dev.credentialPublicKey;
            dev.credentialPublicKey = new Uint8Array(tempPublicKey.buffer);
            dbAuthenticator = dev;
            break;
        }
    }
    if (!dbAuthenticator) {
        return res.status(400).send({
            error: 'Authenticator is not registered with this site',
        });
    }

    let verification;
    try {
        const opts = {
            response: body,
            expectedChallenge: `${expectedChallenge}`,
            expectedOrigin,
            expectedRPID: rpID,
            authenticator: dbAuthenticator,
            requireUserVerification: false,
        };
        verification = await verifyAuthenticationResponse(opts);
    } catch (error) {
        const _error = error;
        console.error(_error);
        return res.status(400).send({ error: _error.message });
    }

    const { verified, authenticationInfo } = verification;

    if (verified) {
        dbAuthenticator.counter = authenticationInfo.newCounter;
    }
    req.session.currentChallenge = undefined;
    res.send({ verified });
});

app.get("/", function (req, res) {
    res.sendFile(__dirname + '/front/index.html');
});

mongoose.connect(mongoDBURL)
    .then(() => {
        console.log("Mongo DB connected");
        app.listen(port, function () {
            console.log(`App is listening on port:${port}`);
        });
    }).catch((error) => {
        console.log(error);
    });