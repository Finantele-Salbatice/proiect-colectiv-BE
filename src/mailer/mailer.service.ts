import { ConfigProvider } from 'src/system/ConfigProvider';
import {createTransport} from 'nodemailer'; 
import Mail from 'nodemailer/lib/mailer';
import { Injectable } from '@nestjs/common';


@Injectable()
export class MailerService {
    transporter: Mail;

    constructor(private configProvider: ConfigProvider) {
      this.transporter = createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: 'finantelesalbatice@gmail.com', 
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }

    get emailPassword(): string {
      return this.configProvider.getConfig().EMAIL_PASSWORD;
    }
    
    get uiHost(): string {
      return this.configProvider.getConfig().UI_HOST;
    }

    async sendResetEmail(t: string, email: string): Promise<any> {
      const info = await this.transporter.sendMail({
        from: '"Finantele Salbatice" <finantelesalbatice@gmail.com>', // sender address
        to: email, // list of receivers
        subject: 'Reset Password', // Subject line
        text: `Click here to reset your password ${this.uiHost}/reset/${t}`,
      });
      return info;
          
    } 
    async sendActivateAccountEmail(t: string, email: string): Promise<any> {
      const info = await this.transporter.sendMail({
        from: '"Finantele Salbatice" <finantelesalbatice@gmail.com>', // sender address
        to: email, // list of receivers
        subject: 'Activate Account', // Subject line
        text: `Click here to activate your accont ${this.uiHost}/activate/${t}`,
      });
      return info;
    } 
   
    

}