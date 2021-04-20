const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'ture.thornvik@gmail.com',
    subject: 'Thanks for joining',
    text: `Thank you for joining ${name}`,
  })
}

const sendCancelEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'ture.thornvik@gmail.com',
    subject: 'Sad to se you go',
    text: `It is sad to see that you are leaving us ${name}.I hope you find what you are looking for`,
  })
}

module.exports = {
  sendWelcomeEmail,
  sendCancelEmail
}
