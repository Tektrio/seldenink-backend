const Customer = require('../models/Customer');
const nodemailer = require('nodemailer');

exports.sendMailer = async (req,res) => {
    const user = await Customer.findOne({ email: req.body.email });
    
    if(req.body.email == ''){
        return res.send({
            success: false,
            error: 'email field is required'       
        })
    }

    if(!user){
        return res.send({
            success: false,
            error: 'Your e-mail is not registered on our database.'
        })
    }
    
    const html = `
    <div style="background: #101820; width: 600px; padding: 30px; margin: auto;">
        <div>
            <img style="display: flex;margin: auto;" src="https://seldenink.vercel.app/assets/selden-logo-icon-e9364de7.webp" alt="">
            <p style="color: #ACACAC;text-align: center;font-family: 'effra', sans-serif;font-size: 16px;font-style: normal;font-weight: 400;line-height: 150%;letter-spacing: 0.96px;margin-top: 64px;margin-bottom: 64px;">You have just received a new response on the Services Brothers form.</p>
        </div>
        <div style="display: flex; column-gap: 64px;">
            <div style="color: #fafafa;">
                <p style="color: #F2F2F2;font-family: 'effra', sans-serif; font-size: 16px;font-style: normal;font-weight: 700;line-height: 150%;letter-spacing: 0.96px;">E-mail</p>
                <p style="color: #F2F2F2;font-family: 'effra', sans-serif; font-size: 16px;font-style: normal;font-weight: 700;line-height: 150%;letter-spacing: 0.96px;">Your password is:</p>
               
            </div>
            <div style="color: #fafafa;">
                <p style="color:#ACACAC;font-family: 'effra', sans-serif;font-size: 16px;font-style: normal;font-weight: 400;line-height: 150%;letter-spacing: 0.96px;">${req.body.email}</p>
                <p style="color:#ACACAC;font-family: 'effra', sans-serif;font-size: 16px;font-style: normal;font-weight: 400;line-height: 150%;letter-spacing: 0.96px; color: #FAFAFA;">${user.confirmpassword}</p> 
            </div>
        </div>

        <div style="margin-top: 40px; text-align: center;">
            <p style="color: #ACACAC;text-align: center;font-family: 'effra',sans-serif;font-size: 16px;font-style: normal;font-weight: 400;line-height: 150%;letter-spacing: 0.96px;">Email received on 07/12/2023 at 7 pm.</p>
        </div>
    </div>`;



    const transport = nodemailer.createTransport({
        host:'smtp-relay.sendinblue.com',
        port: 587,
        secure: false,
        auth: {
            user: 'rafael@tektrio.com',
            pass: '4tCmrApkEKIbN1vO'
        }
    })


    try {
        await transport.sendMail({
            from: 'Contato - <' + req.body.email + '>',
            to: req.body.email,
            subject: 'Selden Ink',
            html: html,
            text: 'You receive an email from selden Ink.'
        })

        return res.send({
            message: "Please check your inbox email to recover your password.",
            success: true,
            data: user
        });
    }catch(err){
        console.log(err);
    } 
}