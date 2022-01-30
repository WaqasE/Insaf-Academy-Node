const nodemailer = require("nodemailer");

const SendMail = async (link, to) => {
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
            from: '"Insaf Academy" <insaf@btech-group.com>', // sender address
            to: to,
            subject: 'Reset Password',
            text: `Copy/paste the link below to reset your password \n
                    ${link}
                    `,
            html: `
                <h3>Reset Password</h3>
                <p>Click on the link below to reset password</p>
                <p><a href="${link}">Click Here</a></p>
                <p>Insaf Academy</p>
            `
        });
        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        return true
    }catch(e){
        console.log("Error", e)
        return e
    }
}

module.exports = {SendMail}