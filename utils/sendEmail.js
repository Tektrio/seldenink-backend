const nodemailer = require('nodemailer');

// console.log(process.env.TEKTRIO_USER);
// console.log(process.env.TEKTRIO_PASS);

async function sendMailer(options){
    const transport = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com', // Host anterior que funcionava
        port: 587,
        secure: false, // false para a porta 587 com STARTTLS
        auth: {
            user: 'rafael@tektrio.com',
            pass: '4tCmrApkEKIbN1vO',
        },
        tls: {
            // Se houver problemas de certificado, essa opção pode ajudar temporariamente
            rejectUnauthorized: false
        }
    });

    const mailerOptions = {
        from: 'Selden Ink <luiz@tektrio.com>',
        to: options.to, 
        subject: options.subject,
        text: options.message
    }

    const info = await transport.sendMail(mailerOptions);

    return info;
}


module.exports = sendMailer;