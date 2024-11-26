const express = require('express');
const PassKeyModel = require('../model/passKeyModel.js');

const passkeyRoutes = express.Router();

//! get all or by filter
passkeyRoutes.get('/', async (req, res) => {
    try {
        const allPasskeys = await PassKeyModel.find({});
        return res.status(200).send({
            count: allPasskeys.length,
            data: allPasskeys,
        });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

//! create
passkeyRoutes.post('/', async (req, res) => {
    try {
        if (!req.body.id) {
            return res.status(400).send({ error: "Please fill all information" });
        }
        const passkeyObj = {
            id: req.body.id,
            publicKey: req.body.publicKey,
            userId: req.body.userId,
            webauthnUserID: req.body.webauthnUserID,
            counter: req.body.counter,
            deviceType: req.body.deviceType,
            backedUp: req.body.backedUp,
            devices: req.body.devices
        };
        await PassKeyModel.create(passkeyObj);
        return res.status(201).send({ message: "Auth Passkey Created", user: passkeyObj });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

//! get by id
passkeyRoutes.get('/:id', async (req, res) => {
    try {
        var { id } = req.params;
        const passKeyById = await PassKeyModel.findById(id);
        return res.status(200).send({data: passKeyById});
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

//! put-update by id
passkeyRoutes.put('/:id', async (req, res) => {
    try {
        if (!req.body.id) {
            return res.status(400).send({ error: "Please fill all information" });
        }
        var { id } = req.params;
        const passkeyObj = {
            id: req.body.id,
            publicKey: req.body.publicKey,
            userId: req.body.userId,
            webauthnUserID: req.body.webauthnUserID,
            counter: req.body.counter,
            deviceType: req.body.deviceType,
            backedUp: req.body.backedUp,
            devices: req.body.devices
        };
        const passkeyById = await PassKeyModel.findByIdAndUpdate(id, passkeyObj);
        if (!passkeyById) {
            return res.status(404).send({ message: "Passkey not found!" });
        }
        return res.status(200).send({message: "Auth Passkey Updated"});
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

//! delete
passkeyRoutes.delete('/:id', async (req, res) => {
    try {
        var { id } = req.params;
        const passKeyToDelete = await PassKeyModel.findByIdAndDelete(id);
        if (!passKeyToDelete) {
            return res.status(404).send({ error: "PassKey not found!" });
        }
        return res.status(200).send({ message: "PassKey deleted successfully" });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});


module.exports.passkeyRoutes = passkeyRoutes