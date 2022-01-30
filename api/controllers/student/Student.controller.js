const mongoose = require('mongoose');
const { Student } = require('../../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const config = require('config');

class StudentController {
    constructor() {}

    async Create(req, res) {
        console.log(req.body)
    }
}

module.exports = new StudentController();