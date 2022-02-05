const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "vageta8301@gmail.com",
    subject: "Thank for joining in!",
    text: `Welcome to app. ${name}`,
  });
};

const sendCancelEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "vageta8301@gmail.com",
    subject: "Canceling app",
    text: `Good bye, ${name}.`,
  });
};

module.exports = { sendWelcomeEmail, sendCancelEmail };
