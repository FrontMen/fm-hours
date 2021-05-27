/* eslint-disable @typescript-eslint/no-var-requires */
import * as functions from "firebase-functions";
import { createTransport, SendMailOptions, TransportOptions } from "nodemailer";
import { google } from "googleapis";
const cors = require("cors")({ origin: true });
const OAuth2 = google.auth.OAuth2;

export const sendMail = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    const createTransporter = async () => {
      const oauth2Client = new OAuth2(
        functions.config().mail.clientid,
        functions.config().mail.clientsecret,
        "https://developers.google.com/oauthplayground"
      );

      oauth2Client.setCredentials({
        refresh_token: functions.config().mail.refreshtoken,
      });

      const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
          if (err) {
            reject(new Error("Failed to create access token"));
          }
          resolve(token);
        });
      });

      const transporter = createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: functions.config().mail.user,
          accessToken,
          clientId: functions.config().mail.clientid,
          clientSecret: functions.config().mail.clientsecret,
          refreshToken: functions.config().mail.refreshtoken,
        },
      } as TransportOptions);

      return transporter;
    };

    const { to, subject, html } = req.body;

    const mailOptions = {
      from: `Uren <${functions.config().mail.user}>"`,
      to,
      subject,
      html,
    } as SendMailOptions;

    const sendEmail = async (emailOptions: SendMailOptions) => {
      const emailTransporter = await createTransporter();

      return emailTransporter.sendMail(emailOptions, (error) => {
        if (error) {
          functions.logger.log("error", error);
          return res.status(500).send(error.toString());
        }
        return res.send("E-mail sent successfully!");
      });
    };

    try {
      return sendEmail(mailOptions);
    } catch (err) {
      functions.logger.log("error", err);
      return res.status(500).send(err.toString());
    }
  });
});
