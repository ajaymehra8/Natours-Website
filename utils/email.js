const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = process.env.Email_Username;
  }
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //sendgrid implemention
      return 1;
    }
    return nodemailer.createTransport({
      service: 'gmail',

      auth: {
        user: process.env.Email_Username,
        pass: process.env.Email_Password,
      },
    });
  }
  async send(template, subject) {
    // send the actual mail
    // 1) Render HTML based on pug template
    const html = pug.renderFile(
      `${__dirname}/../views/email/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      },
    );
    // 2) Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html, {
        wordwrap: 130,
      }),
      //html:
    };

    // 3)Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the natours family');
  }
  async sendPasswordReset(){
    await this.send('passwordReset','Your password reset token. (Valid only for 10 minutes)')
  }
};
