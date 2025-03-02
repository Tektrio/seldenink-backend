const nodemailer = require('nodemailer');


exports.sendContact = (req,res) => {
    const { first_name, last_name, email, phone, message } = req.body;
    const fullName = first_name + ' ' + last_name;
    let data = new Date();
    let dia = String(data.getDate()).padStart(2, '0');
    let mes = String(data.getMonth() + 1).padStart(2, '0');
    let ano = data.getFullYear();
    let hora = data.toLocaleString('en-US',{ hour: 'numeric', hour12: true });
    let dataAtual = `${dia}/${mes}/${ano}`;

    if(!first_name || !last_name){
        return res.status(422).json({ result: 'first_name and last_name are required' });
    }

    if(!email){
        return res.status(422).json({ result: 'email field are required.' });
    }

    if(!phone){
        return res.status(422).json({ result: 'phone field are required.' });
    }

    if(!message){
        return res.status(422).json({ result: 'message field are required.' });
    }

    const html = `
    <div style="background: #101820; width: 600px; padding: 30px; margin: auto;">
        <div>
            <img style="display: flex;margin: auto;" src="https://seldenink.vercel.app/assets/selden-logo-icon-e9364de7.webp" alt="">
            <p style="color: #ACACAC;text-align: center;font-family: 'effra', sans-serif;font-size: 16px;font-style: normal;font-weight: 400;line-height: 150%;letter-spacing: 0.96px;margin-top: 64px;margin-bottom: 64px;">You have just received a new response on the Selden Ink form.</p>
        </div>
        <div style="display: flex; column-gap: 64px;">
            <div style="color: #fafafa;">
                <p style="color: #F2F2F2;font-family: 'effra', sans-serif; font-size: 16px;font-style: normal;font-weight: 700;line-height: 150%;letter-spacing: 0.96px;">Name</p>
                <p style="color: #F2F2F2;font-family: 'effra', sans-serif; font-size: 16px;font-style: normal;font-weight: 700;line-height: 150%;letter-spacing: 0.96px;">Email</p>
                <p style="color: #F2F2F2;font-family: 'effra', sans-serif; font-size: 16px;font-style: normal;font-weight: 700;line-height: 150%;letter-spacing: 0.96px;">Phone</p>
                <p style="color: #F2F2F2;font-family: 'effra', sans-serif; font-size: 16px;font-style: normal;font-weight: 700;line-height: 150%;letter-spacing: 0.96px;">Message</p>
            </div>
            <div style="color: #fafafa;">
                <p style="color:#ACACAC;font-family: 'effra', sans-serif;font-size: 16px;font-style: normal;font-weight: 400;line-height: 150%;letter-spacing: 0.96px;">${fullName}</p>
                <p style="color:#ACACAC;font-family: 'effra', sans-serif;font-size: 16px;font-style: normal;font-weight: 400;line-height: 150%;letter-spacing: 0.96px; color: #FAFAFA;">${email}</p>
                <p style="color:#ACACAC;font-family: 'effra', sans-serif;font-size: 16px;font-style: normal;font-weight: 400;line-height: 150%;letter-spacing: 0.96px;">${phone}</p>
                <p style="color:#ACACAC;font-family: 'effra', sans-serif;font-size: 16px;font-style: normal;font-weight: 400;line-height: 150%;letter-spacing: 0.96px;">${message}</p>
            </div>
        </div>

        <div style="margin-top: 40px; text-align: center;">
            <p style="color: #ACACAC;text-align: center;font-family: 'effra',sans-serif;font-size: 16px;font-style: normal;font-weight: 400;line-height: 150%;letter-spacing: 0.96px;">Email received on ${dataAtual} at ${hora}.</p>
        </div>
    </div>`;

    const emails = ['rafael@tektrio.com'];

    const transport = nodemailer.createTransport({
        host:'smtp-relay.sendinblue.com',
        port: 587,
        secure: false,
        auth: {
            user: 'rafael@bigapplepia.com',
            pass: 'wPSZ971UFpKN0Yvj'
        }
    })

    transport.sendMail({
        from: 'Contato - <' + email + '>',
        // to: 'rafael@myinktattoo.com',
        to: emails,
        subject: 'Form Book Now',
        html: html,
        text: 'You receive an email from book now page.'
    })
    .then(data => {
        res.status(200).send({ data: 'Email sent successfuly.'});
    }).catch(err => console.error(err))

}