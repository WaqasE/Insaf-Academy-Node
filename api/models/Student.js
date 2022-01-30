const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const salt = bcrypt.genSaltSync(10);
var refresh_tokens = {}

const Schema = mongoose.Schema;

// Create Schema
const StudentSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    cnic: {
        type: String,
    },
    email: {
        type: String,
        required: true
    },
    address:
    {
        county: {
            type: String,
            default: 'Pakistan'
        },
        province: {
            type: String,
            default: 'Punjab'
        },
        district: {
            type: String,
            default: 'Lahore'
        },
        city: {
            type: String,
            default: 'Lahore'
        },
        board: {
            type: String,
            default: 'Punjab Board'
        },
        school: {
            type: String,
            required: true,
        },
    },
    gender: {
        type: String,
        required: true,
    },
    classLevel: {
        type: String,
    },
    image: {
        type: String,
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'BLOCKED'],
        default: 'ACTIVE'
    },
    hash: {
        type: String,
        default: ''
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
});

StudentSchema.methods.jwtToken = async function () {
    try {

        const token = jwt.sign({ id: this._id, fullName: this.fullName, email: this.email }, config.get('myprivatekey'), { expiresIn: '105min' });
        const refresh_token = jwt.sign({ email: this.email }, config.get('myprivatekey'), { expiresIn: '15d' });
        refresh_tokens[refresh_token] = this.email
        return { token, refresh_token };
    } catch (e) {
        return null;
    }
}

StudentSchema.methods.refreshToken = async function (refresh_token) {
    try {
        if (refresh_token in refresh_tokens && refresh_tokens[refresh_token] === this.email) {
            const token = jwt.sign({ id: this.id, fullName: this.fullName, email: this.email }, config.get('myprivatekey'), { expiresIn: '105min' });
            return Promise.resolve(token);
        } else {
            return Promise.reject('Invalid Token Request')
        }
    }
    catch (error) {
        return Promise.reject(error)
    }
}

StudentSchema.methods.logout = async function () {
    try {
        refresh_tokens = Object.keys(refresh_tokens).filter(key => refresh_tokens[key] !== this.email);
        return true

    }
    catch (error) {
        return false
    }
}

StudentSchema.methods.validateToken = async function (token) {
    const refresh_token = Object.keys(refresh_tokens).find(key => refresh_tokens[key] === this.email);
    if (refresh_token) {
        // var new_token = await this.refreshToken(refresh_token);
        return true
        // if(new_token)
        //     return { token: new_token, authenticated:true }
        // else
        //     return null
    }
    else {
        return false
    }
}

module.exports = Student = mongoose.model("student", StudentSchema);