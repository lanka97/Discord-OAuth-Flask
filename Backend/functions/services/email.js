const nodemailer = require('nodemailer');
const emailConstants = require('../util/email');
const constants = require('../util/constants');

const sentEmail = (reciever_email, resetLink, action) => {

    var output = '';
    var subject = '';
    var text = '';
    if (action === constants.RESET_PW_ACTION) {
        output = constants.EMAIL_PASS_RESET_HTML;
        subject = constants.EMAIL_PWD_RESET_SUBJECT;
        text = emailConstants.EmailPwdResetText(reciever_email, resetLink)
    }
    try {
        let transporter = nodemailer.createTransport({
            service: constants.EMAIL_SERVICE,
            secure: false,
            port: constants.EMAIL_PORT,
            auth: {
                user: constants.EMAIL_AUTH_USER_NAME,
                pass: constants.EMAIL_AUTH_USER_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        let mailOptions = {
            from: constants.MAIL_OPTIONS_FROM,
            to: reciever_email,
            subject: subject,
            text: text,
            html: output
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                return console.log(err);
            }

        });
    } catch (err) {

    }
}

const sentNewsLetterEmail = (reciever_email, textBody, htmlBody, emailSubject) => {

    var output = '';
    var subject = '';
    var text = '';
    output = htmlBody;
    subject = emailSubject;
    text = textBody;
    try {
        let transporter = nodemailer.createTransport({
            service: constants.EMAIL_SERVICE,
            // secure: false,
            port: constants.EMAIL_PORT,
            auth: {
                user: constants.EMAIL_AUTH_USER_NAME,
                pass: constants.EMAIL_AUTH_USER_PASSWORD
            },
            debug: true, // show debug output
            logger: true // log information in console
        });

        let mailOptions = {
            from: constants.MAIL_OPTIONS_FROM,
            to: reciever_email,
            subject: subject,
            text: text,
            html: output
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                return console.log(err);
            }

        });
    } catch (err) {

    }
}
module.exports = {
    sentEmail,
    sentNewsLetterEmail
}