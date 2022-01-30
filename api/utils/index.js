const { validationResult } = require('express-validator');
const { User } = require('../models')
const niv = require('node-input-validator');
const models = require('../models');
const { SendMail } = require('./mailer')

const validation_errors = (req) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        // console.log("Errors", errors.array())
        const extractedErrors = {}
        // errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))
        errors.array().map((err, e) => extractedErrors[err.param] = err.msg)
        return extractedErrors;
    }
    else {
        return null;
    }

}

const isUserEmailUnique = async (val, { req }) => {
    return User.find({ email: val }).then((count) => {
        return count.length > 0 ? Promise.reject() : Promise.resolve(true);
    })
}



const parseJwt = (token) => {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};


niv.extend('unique', async ({ value, args }) => {
    // default field is email in this example
    const ModelName = args[0];
    const filed = args[1];
    let condition = {};
    condition[filed] = value;
    if (args[2]) {
        // condition['id'] = { [Op.ne]: args[2]};
        condition['_id'] = { $ne: mongoose.Types.ObjectId(args[2]) };

    }

    let recordExist = await models[ModelName].findOne({ where: condition });

    // email already exists
    if (recordExist) {
        return false;
    }

    return true;
});




module.exports = { validation_errors, isUserEmailUnique, niv, parseJwt, SendMail }