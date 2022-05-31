import {VercelRequest, VercelResponse} from '@vercel/node';
import {createTransport, SendMailOptions, TransportOptions} from 'nodemailer';
import {google} from 'googleapis';
const OAuth2 = google.auth.OAuth2;

export default function SendMail(request: VercelRequest, response: VercelResponse) {
  try {
    const createTransporter = async () => {
        const oauth2Client = new OAuth2(
        //   functions.config().mail.clientid,
        //   functions.config().mail.clientsecret,
          'https://developers.google.com/oauthplayground'
        );
  
        oauth2Client.setCredentials({
        //   refresh_token: functions.config().mail.refreshtoken,
        });
  
        const accessToken = await new Promise((resolve, reject) => {
          oauth2Client.getAccessToken((error: any, token: any) => {
            if (error) {
              reject(new Error('Failed to create access token'));
            }
            resolve(token);
          });
        });
  
        return createTransport({
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            // user: functions.config().mail.user,
            accessToken,
            // clientId: functions.config().mail.clientid,
            // clientSecret: functions.config().mail.clientsecret,
            // refreshToken: functions.config().mail.refreshtoken,
          },
        } as TransportOptions);
      };
  
      const {to, subject, html} = request.body;
  
      const mailOptions = {
        // from: `Uren <${functions.config().mail.user}>"`,
        to,
        subject,
        html,
      } as SendMailOptions;
  
      const sendEmail = async (emailOptions: SendMailOptions) => {
        const emailTransporter = await createTransporter();
  
        return emailTransporter.sendMail(emailOptions, (error: any) => {
          if (error) {
            // functions.logger.log('error', error);
            return response.status(500).send(error.toString());
          }
          return response.send('E-mail sent successfully!');
        });
      };
  
      try {
        return sendEmail(mailOptions);
      } catch (error: any) {
        // functions.logger.log('error', err);
        return response.status(500).send(error.toString());
      }
  } catch (error: any) {
    return response.status(401).json({
      message: error.message,
    });
  }
}