import nodemailer from 'nodemailer';

type SendEmailInputs = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

export const sendEmail = async ({
  from,
  to,
  subject,
  html,
}: SendEmailInputs) => {
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });

  console.log('Message sent: %s', info.messageId);

  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
};

export const activationEmail = (token: string) => {
  const html = `Hi there,
      <br/>
      Thank you for registering!
      <br/><br/>
      Please verify your email by clicking the following link:
      <br/>
      On the following page:
      <a target="_blank" href="localhost:3000/accountActivation/${token}">localhost:3000/accountActivation/${token}</a>
      <br/><br/>
      Have a pleasant day.`;
  return html;
};

export const resetPasswordEmail = (token: string) => {
  const html = `
      <h1>Please use the following link to reset your password</h1>
      <a target="_blank" href="localhost:3000/passwordReset/${token}">localhost:3000/passwordReset/${token}</a>`;
  return html;
};
