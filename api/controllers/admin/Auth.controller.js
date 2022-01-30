const {User} = require('../../models')
const {niv, SendMail} = require('../../utils')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const config = require('config');

class AuthController {
    constructor() {
    }


    async Login(req, res) {

        var form_data = req.body;
        const validator = new niv.Validator(form_data, {
            email: 'required|email',
            password: 'required'
        });

        validator.niceNames({
            email: "Email Address",
            password: 'Password'
        })

        let isValid = await validator.check()
        if(!isValid){
            return res.status(400).json({error: 'Invalid Login ID/Password'});
        }

        let {email, password} = form_data

        try{            
            const res_user =await User.findOne({email:email}).select('+password').exec()
            if(res_user){
                let result = await bcrypt.compare(password, res_user?.password);            
                if(res_user && result){    
                    var login_user = await User.findOne({email}).populate('roles');
                    var tokens = await login_user.jwtToken()                                
                    if(tokens){
                        var {token, refresh_token} = tokens
                        return res.status(200).json({user: login_user,token, refresh_token})
                    }            
                    throw('Invalid Request')
                }
                throw("Invalid Login details")
            }
            throw("Invalid Login details")
        }
        catch(e){            
            return res.status(400).json({error: e});
        }
    }

    async Signup(req, res){
        
        var form_data = req.body;
        const validator = new niv.Validator(form_data, {
            first_name: 'required|string',
            last_name: 'required|string',
            email: 'required|email',
            password: 'required'
        });
        validator.niceNames({
            first_name: 'First Name',
            last_name: 'Last Name',
            email: "Email Address",
            password: 'Password'
        })

        let isValid = await validator.check();
        if(!isValid){
            return res.status(400).json({error: validator.errors});
        }

        new User({
                first_name: form_data.first_name,
                last_name: form_data.last_name,
                email: form_data.email,
                password: bcrypt.hashSync(form_data.password, salt)
        })
        .save()
        .then((user) => {
            console.log("Error", user)
            return res.status(200).json({user})
        })
        .catch((error) => {
            console.log("Error", error)
            return res.status(400).json({error: error});
        })
    }

    async Logout(req, res) {
        try{
            var bearerHeader = req.headers['authorization'];
            if (bearerHeader){
                var token;
                var bearer = bearerHeader.split(" ");
                token = bearer[1];
                jwt.verify(token, config.get('myprivatekey'), async function (err, decoded){
                    if (err){
                        return res.status(400).json({error: "Session Expired", msg: err})
                    }
                    else {
                        try{
                            var login_user = await User.findOne({email: decoded.email});
                            let isLogout = await login_user.logout()
                            // if(isLogout){
                            //     return res.status(200).json({})
                            // }
                        }
                        catch(e){
                            return res.status(400).json({error: e});
                        }                
                    }
                }) 
                return res.status(200).json('logout');
            }
            else{
                throw Error('Invalid Token')            
            }
        }catch(err){
            return res.status(500).json(err.message);
        }
    }

    async Me(req, res){
        User.find({}).then((users) => {
            return res.status(200).json(users);
        })
        .catch((error) => {
        })
    }

    async CheckAuth(req, res){
        try{
            var check_user = await User.findById(req?.decoded?.id)
            var auth_data = await check_user.validateToken()
            if(auth_data)
                return res.status(200).json({token: auth_data.token });
            else
                return res.status(400).json({error: 'Unauthorized'});    
        }
        catch(e){
            return res.status(400).json({error: e});
        }

    }

    refreshToken(req, res, next){
        var {refresh_token} = req.query;
        jwt.verify(refresh_token, config.get('myprivatekey'), async function (err, decoded){
            console.log("Decoded", decoded)
            if (err){
                return res.status(401).json({error: "Session Expired", msg: err})
            }
            else {
                try{
                    var login_user = await User.findOne({email: decoded.email});
                    var access_token = await login_user.refreshToken(refresh_token)
                    if(access_token){                    
                        return res.status(200).json({token: access_token})
                    }            
                    throw('Invalid Request')
                }
                catch(e){                    
                    return res.status(400).json({error: e});
                }                
            }
        })        
    }

    async ForgetPassword(req, res){
        
        var form_data = req.body;
        const validator = new niv.Validator(form_data, {
            email: 'required|email',
        });

        validator.niceNames({
            email: "Email Address",
        })

        let isValid = await validator.check()
        if(!isValid){
            return res.status(400).json({error: 'Email address is required'});
        }


        try{            
            const res_user =await User.findOne({email:form_data.email})
            if(res_user){                
                const resetToken = await jwt.sign({ id: res_user._id}, config.get('myprivatekey'), { expiresIn: '60min' });
                await User.updateOne({ _id: res_user._id },{ $set: { hash: resetToken } });
                const link = `http://192.168.18.74:3000/reset-password/${resetToken}/${res_user._id}`;
                await SendMail(link, res_user.email)
                return res.status(200).json({message: 'Password reset email has been sent to your email. Please check your email to reset password.'})
                // 
            }
            throw('Invalid Email Address')

        }
        catch(e){
            return res.status(400).json({error: e})
        }
    }

    async ValidatePasswordRequest (req, res){
        var form_data = req.body;
        
        const validator = new niv.Validator(form_data, {
            hash: 'required',
            id: 'required',
        });

        validator.niceNames({
            hash: "Token",
        })

        let isValid = await validator.check()
        if(!isValid){
            return res.status(400).json({error: 'Invalid Request'});
        }

        try{            
            const res_user =await User.findOne({hash:form_data.hash, _id: form_data.id})
            if(res_user){                
                return res.json({message: 'Reset Password'})
            }
            throw('Invalid Request')

        }
        catch(e){
            return res.status(400).json({error: e})
        }


    }

    async ResetPassword (req, res){
        var form_data = req.body;        
        const validator = new niv.Validator(form_data, {
            password: 'required|same:confirm_password',
            id: 'required'
        });

        validator.niceNames({
            password: "Password",
            id: 'User'
        })

        let isValid = await validator.check()
        if(!isValid){
            return res.status(400).json({error: 'Invalid Request'});
        }

        try{            
            await User.updateOne({ _id: form_data.id },{ $set: { password: bcrypt.hashSync(form_data.password, salt), hash: '' } });            
            return res.json({message: 'Password updated successfully. Please Login to continue'})            

        }
        catch(e){
            return res.status(400).json({error: e})
        }
    }

    
}

module.exports = new AuthController();