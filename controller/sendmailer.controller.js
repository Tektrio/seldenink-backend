const nodemailer = require('nodemailer');

exports.sendMailer = (req,res) => {
    const { first_name, last_name, email, phone, birth, gender, interest, type_tattoo, size, piercing } = req.body;
    const fullName = first_name + ' ' + last_name;

    if(!first_name || !last_name){
        return res.status(422).json({ result: 'O campo first_name e last_name devem ser preenchido' });
    }

    if(!email){
        return res.status(422).json({ result: 'O campo e-mail deve ser preenchido.' });
    }

    if(!phone){
        return res.status(422).json({ result: 'O campo phone deve ser preenchido.' });
    }

    if(!birth){
        return res.status(422).json({ result: 'O campo birth deve ser preenchido.' });
    }

    if(!gender){
        return res.status(422).json({ result: 'O campo gender deve ser preenchido.' });
    }

    if(!interest){
        return res.status(422).json({ result: 'O campo interest deve ser preenchido.' });
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
                <p style="color: #F2F2F2;font-family: 'effra', sans-serif; font-size: 16px;font-style: normal;font-weight: 700;line-height: 150%;letter-spacing: 0.96px;">Date of Birth</p>
                <p style="color: #F2F2F2;font-family: 'effra', sans-serif; font-size: 16px;font-style: normal;font-weight: 700;line-height: 150%;letter-spacing: 0.96px;">Gender</p>
                <p style="color: #F2F2F2;font-family: 'effra', sans-serif; font-size: 16px;font-style: normal;font-weight: 700;line-height: 150%;letter-spacing: 0.96px;">Service of Interest</p>
                <p style="color: #F2F2F2;font-family: 'effra', sans-serif; font-size: 16px;font-style: normal;font-weight: 700;line-height: 150%;letter-spacing: 0.96px;">${type_tattoo != null && type_tattoo != '' ? 'Type of Tattoo' : ''}</p>
                <p style="color: #F2F2F2;font-family: 'effra', sans-serif; font-size: 16px;font-style: normal;font-weight: 700;line-height: 150%;letter-spacing: 0.96px;">${size != null && size != '' ? 'Size' : ''}</p>
                <p style="color: #F2F2F2;font-family: 'effra', sans-serif; font-size: 16px;font-style: normal;font-weight: 700;line-height: 150%;letter-spacing: 0.96px;">${piercing != null && piercing != '' ? 'Piercing Location' : ''}</p>
            </div>
            <div style="color: #fafafa;">
                <p style="color:#ACACAC;font-family: 'effra', sans-serif;font-size: 16px;font-style: normal;font-weight: 400;line-height: 150%;letter-spacing: 0.96px;">${fullName}</p>
                <p style="color:#ACACAC;font-family: 'effra', sans-serif;font-size: 16px;font-style: normal;font-weight: 400;line-height: 150%;letter-spacing: 0.96px; color: #FAFAFA;">${email}</p>
                <p style="color:#ACACAC;font-family: 'effra', sans-serif;font-size: 16px;font-style: normal;font-weight: 400;line-height: 150%;letter-spacing: 0.96px;">${phone}</p>
                <p style="color:#ACACAC;font-family: 'effra', sans-serif;font-size: 16px;font-style: normal;font-weight: 400;line-height: 150%;letter-spacing: 0.96px;">${birth}</p>
                <p style="color:#ACACAC;font-family: 'effra', sans-serif;font-size: 16px;font-style: normal;font-weight: 400;line-height: 150%;letter-spacing: 0.96px;">${gender}</p>
                <p style="color:#ACACAC;font-family: 'effra', sans-serif;font-size: 16px;font-style: normal;font-weight: 400;line-height: 150%;letter-spacing: 0.96px;">${interest}</p>
                <p style="color:#ACACAC;font-family: 'effra', sans-serif;font-size: 16px;font-style: normal;font-weight: 400;line-height: 150%;letter-spacing: 0.96px;">${type_tattoo != null && type_tattoo != '' ? type_tattoo : ''}</p>
                <p style="color:#ACACAC;font-family: 'effra', sans-serif;font-size: 16px;font-style: normal;font-weight: 400;line-height: 150%;letter-spacing: 0.96px;">${size != null && size != '' ? size : ''}</p>
                <p style="color:#ACACAC;font-family: 'effra', sans-serif;font-size: 16px;font-style: normal;font-weight: 400;line-height: 150%;letter-spacing: 0.96px;">${piercing != null && piercing != '' ? piercing : ''}</p>
            </div>
        </div>

        <div style="margin-top: 40px; text-align: center;">
            <p style="color: #ACACAC;text-align: center;font-family: 'effra',sans-serif;font-size: 16px;font-style: normal;font-weight: 400;line-height: 150%;letter-spacing: 0.96px;">Email received on 07/12/2023 at 7 pm.</p>
        </div>
    </div>`;

    const emails = ['luiz@myinktattoo.com'];

    const transport = nodemailer.createTransport({
        host:'smtp-relay.sendinblue.com',
        port: 587,
        secure: false,
        auth: {
            user: 'rafael@tektrio.com',
            pass: '4tCmrApkEKIbN1vO'
        }
    })

    transport.sendMail({
        from: 'Contato - <' + email + '>',
        // to: 'luiz@myinktattoo.com',
        to: emails,
        subject: 'Form Book Now',
        html: html,
        text: 'You receive an email from book now page.'
    })
    .then(data => {
        res.status(200).send({ data: 'Email sent successfuly.'});
    }).catch(err => console.error(err))
}