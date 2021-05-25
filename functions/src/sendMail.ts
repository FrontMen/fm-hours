/* eslint-disable @typescript-eslint/no-var-requires */
import * as functions from "firebase-functions";
import { createTransport, SendMailOptions } from "nodemailer";
const cors = require("cors")({ origin: true });

export const sendMail = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    const transporter = createTransport({
      service: "gmail",
      auth: {
        user: functions.config().mail.user,
        pass: functions.config().mail.pass,
      },
    });

    const { to, subject, html } = req.body;

    const mailOptions = {
      from: `Frontmen <${functions.config().mail.user}>"`,
      to,
      subject,
      html,
    } as SendMailOptions;

    return transporter.sendMail(mailOptions, (error) => {
      if (error) {
        return res.status(500).send(error.toString());
      }
      return res.send("E-mail sent successfully!");
    });
  });
});
