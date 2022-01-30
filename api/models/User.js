const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const salt = bcrypt.genSaltSync(10);
var refresh_tokens = {}

const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false 
    },
    cnic:{
        type: String,
    },
    phone: {
        type: String,        
    },
    type:{
        type: String,
        enum : ['USER','ADMIN'],
        default: 'USER'
    },
    status:{
        type: String,
        enum : ['ACTIVE','INACTIVE', 'BLOCKED'],
        default: 'ACTIVE'
    },
    roles:{
        type: [mongoose.Types.ObjectId],
        ref: 'role'
    },
    hash:{
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

UserSchema.methods.jwtToken = async function(){
    try{

        const token = jwt.sign({ id: this._id,  first_name: this.first_name, last_name: this.last_name, email: this.email, roles: this.roles}, config.get('myprivatekey'), { expiresIn: '105min' });
        const refresh_token = jwt.sign({email: this.email}, config.get('myprivatekey'), { expiresIn: '15d' });
        refresh_tokens[refresh_token] = this.email        
        return {token, refresh_token};
    }catch(e){
         return null;
    }
}

UserSchema.methods.refreshToken = async function (refresh_token) {
    try{
        if(refresh_token in refresh_tokens && refresh_tokens[refresh_token] === this.email){
            const token = jwt.sign({ id: this.id,  first_name: this.first_name, last_name: this.last_name, email: this.email, roles: this.roles}, config.get('myprivatekey'), { expiresIn: '105min' });
            return Promise.resolve(token);
        }else{
            return Promise.reject('Invalid Token Request')
        }
    }
    catch(error){
        return Promise.reject(error)
    }
}

UserSchema.methods.logout = async function () {
    try{
        refresh_tokens =  Object.keys(refresh_tokens).filter(key => refresh_tokens[key] !== this.email);
        return true

    }
    catch(error){
        return false
    }
}

UserSchema.methods.validateToken = async function (token){
    const refresh_token = Object.keys(refresh_tokens).find(key => refresh_tokens[key] === this.email);
    if(refresh_token){
        // var new_token = await this.refreshToken(refresh_token);
        return true
        // if(new_token)
        //     return { token: new_token, authenticated:true }
        // else
        //     return null
    }
    else{
        return false
    }
}

module.exports = User =  mongoose.model("user", UserSchema);