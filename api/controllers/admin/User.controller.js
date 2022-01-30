const {User} = require('../../models')
const {niv} = require('../../utils')
const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");
const salt = bcrypt.genSaltSync(10);


class UserController {
    constructor() {
    }

    async Create(req, res) {

        var form_data = req.body;
        const validator = new niv.Validator(form_data, {
            first_name: 'required|string',
            last_name: 'required|string',
            email: 'required|email',
            cnic: 'required',
            phone: 'required',
            password: 'required|same:confirm_password|minLength:8|maxLength:30',
            roles: 'required:array'
        });

        validator.niceNames({
            first_name: "First Name",
            last_name: 'Last Name',
            email: 'Email',
            cnic: 'CNIC',
            phone: 'Phone Number',
            password: 'Password',
            roles: 'Roles',
        })

        let isValid = await validator.check()
        if(!isValid){
            return res.status(400).json({error: validator.errors, message: 'Form validation error'});
        }

        new User({
            first_name: form_data.first_name,
            last_name: form_data.last_name,
            email: form_data.email,
            cnic: form_data.cnic,
            phone: form_data.phone,
            roles: form_data.roles,
            password: bcrypt.hashSync(form_data.password, salt)
            })
            .save()
            .then(async (user) => {
                var new_user = await User.findById(user._id).populate('roles')
                return res.status(200).json({user: new_user, message: 'User created successfully'})
            })
            .catch((error) => {
                return res.status(400).json({error: error, message: 'Form validation error'});
            })
    }

    async Update(req, res) {
        var {id} = req.params
        var form_data = req.body;
        const validator = new niv.Validator(form_data, {
            first_name: 'required|string',
            last_name: 'required|string',
            cnic: 'required',
            phone: 'required',
            email: 'required|email',
            confirm_password: 'requiredWith:password',
            password: 'same:confirm_password|minLength:8|maxLength:30',
            roles: 'required:array'
        });

        validator.niceNames({
            first_name: "First Name",
            last_name: 'Last Name',
            email: 'Email',
            password: 'Password',
            roles: 'Roles',
        })

        let isValid = await validator.check()
        if(!isValid){
            return res.status(400).json({error: validator.errors, message: 'Form validation error'});
        }

        try{
            let oldUser = await User.findById(id);
            oldUser.first_name = form_data?.first_name
            oldUser.last_name = form_data?.last_name
            oldUser.email = form_data?.email
            oldUser.cnic = form_data?.cnic
            oldUser.phone = form_data?.phone
            if(form_data?.password){
                oldUser.password = bcrypt.hashSync(form_data.password, salt)
            }
            oldUser.roles = form_data?.roles
            oldUser.updated_at= new Date()
            await oldUser.save()

            var updated_user = await User.findById(id).populate('roles')
            return res.status(200).json({user: updated_user, message: 'User Updated Successfully'})
        }
        catch(error){        
            return res.status(400).json({error: 'Error Updating Role', message: 'Error ocurred'});
        }                
    }


    async Get(req, res) {
        try{          
            var users = await User.find({ }).populate('roles');
            return res.status(200).json({users});

        }catch(e){
            return res.status(400).json({error: e});
        }

    }

    async Delete(req, res) {
        var {id} = req.params
        try{
            User.findById(id).remove().exec();
            return res.status(200).json({id: id, message: 'User removed successfully'})

        }
        catch(e){
            return res.status(400).json({error: e || 'Invalid Request'});
        }

    }

    async SendMail(req, res){
        // let testAccount = await nodemailer.createTestAccount();
        let transporter = nodemailer.createTransport({
            host: "mail.btech-group.com",
            port: 465,
            secure: true,
            auth: {
                user: "insaf@btech-group.com", // generated ethereal user
                pass: "insaf@321!", 
            },
            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: false
                }
        });

        try{
          // send mail with defined transport object
            let info = await transporter.sendMail({
                from: '"Fred Foo 👻" <hello@88websites.net>', // sender address
                to: "awaissahmed@gmail.com", // list of receivers
                subject: "Hello ✔", // Subject line
                text: "Hello world?", // plain text body
                html: "<b>Hello world?</b>", // html body
            });
            console.log("Message sent: %s", info.messageId);
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            // Preview only available when sending through an Ethereal account
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            return res.status(200).json({sent: true})
        }catch(e){
            console.log("Error", e)
            return res.status(400).json({sent: 'no', error: e})
        }
    }

    
}

module.exports = new UserController();