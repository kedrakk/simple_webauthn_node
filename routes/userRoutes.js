const express = require('express');
const UserModel = require('../model/userModel');

const userRoutes = express.Router();

//! get all or by filter
userRoutes.get('/', async (req, res) => {
    try {
        const filterByEmail = req.query.email;
        if (filterByEmail) {
            const usersByEmail = await UserModel.find({ email: filterByEmail });
            return res.status(200).send(usersByEmail);
        }
        const allUsers = await UserModel.find({});
        return res.status(200).send({
            count: allUsers.length,
            data: allUsers,
        });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

//! create
userRoutes.post('/', async (req, res) => {
    try {
        if (!req.body.username || !req.body.email || !req.body.password || !req.body.devices) {
            return res.status(400).send({ error: "Please fill all information" });
        }
        const existingUser = await UserModel.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        const newAuthUser = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            devices: req.body.devices
        };
        await UserModel.create(newAuthUser);
        return res.status(201).send({ message: "Auth User Created", user: newAuthUser });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

//! get by id
userRoutes.get('/:id', async (req, res) => {
    try {
        var { id } = req.params;
        const userById = await UserModel.findById(id);
        return res.status(200).send(userById);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

//! put-update by id
userRoutes.put('/:id', async (req, res) => {
    try {
        if (!req.body.username || !req.body.email || !req.body.devices) {
            return res.status(400).send({ error: "Please fill all information" });
        }
        var { id } = req.params;
        const existingUser = await UserModel.findOne({ email: req.body.email });
        if (existingUser && id != existingUser.id) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        const authUserToUpdate = {
            username: req.body.username,
            email: req.body.email,
            devices: req.body.devices
        };
        const userUpdate = await UserModel.findByIdAndUpdate(id, authUserToUpdate);
        return res.status(200).send({ message: "Auth User Updated" });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

//! patch-update by id
userRoutes.patch('/:id', async (req, res) => {
    try {
        if (JSON.stringify(req.body) === "{}") {
            return res.status(400).send({ error: "Please fill information to update" });
        }
        var { id } = req.params;
        if (req.body.email) {
            const existingUser = await UserModel.findOne({ email: req.body.email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already exists' });
            }
        }
        const user = await UserModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'Auth User not found' });
        }
        return res.status(200).send({ message: "Auth User Updated", user: user });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

//! delete
userRoutes.delete('/:id', async (req, res) => {
    try {
        var { id } = req.params;
        const userToDelete = await UserModel.findByIdAndDelete(id);
        if (!userToDelete) {
            return res.status(404).send({ error: "User not found!" });
        }
        return res.status(200).send({ message: "User deleted successfully" });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});


module.exports.userRoutes = userRoutes
