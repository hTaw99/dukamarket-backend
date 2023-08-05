import { render } from '@react-email/render';
import nodemailer from "nodemailer";

// export class Email {
//   constructor(userToSend) {
//     this.to = userToSend;
//     this.firstName = userToSend.spilit(" ")[0];
//     this.from = "Hady Tawfik hady@gmail.com";
//   }

//   newTransporter() {
//     if (process.env.NODE_ENV === "production") {
//       return 1;
//     }

//     return nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,
//       // port: process.env.EMAIL_PORT,
//       auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD,
//       },
//     });
//   }

//   async send(template, subject) {
//     // 1- Render Html based on a pug template

//     // 2- Define email option
//     const mailOption = {
//       from: this.from,
//       to: this.to,
//       subject: subject,
//       text: template,
//       // html: options.html,
//     };

//     // 3- Create Transport and send email
//     return this.newTransporter().sendMail(mailOption);
//   }

//   sendWelcome() {
//     return send("Welcome", "Welcome to DukaMarket");
//   }
// }

export const sendEmail = async (options) => {
  // Create transporter
  // const transporter = nodemailer.createTransport({
  //   host: process.env.EMAIL_HOST,
  //   // port: process.env.EMAIL_PORT,
  //   auth: {
  //     user: process.env.EMAIL_USERNAME,
  //     pass: process.env.EMAIL_PASSWORD,
  //   },
  // });

  const transporter = nodemailer.createTransport({
    host: "smtp-relay.sendinblue.com",
    port: 587,
    auth: {
      user: "hady.tawfik1999@gmail.com",
      pass: "wPTHzM5UgXRdOq0K"
    },
  });

  const mailOption = {
    from: "DukaMarket teamDuka@gmail.com",
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  await transporter.sendMail(mailOption);
};
