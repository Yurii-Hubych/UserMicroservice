import nodemailer, {Transporter} from 'nodemailer';
import {configs} from "../configs/configs";
import * as path from "node:path";
import hbs from "nodemailer-express-handlebars";
import {EmailTypeEnum} from "../enums/email-type";
import {EmailConstants} from "../constants/email.constants";
import {EmailPayloadType} from "../custom-types/email-type-to-payload.types";


class EmailService {
    private transporter: Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            from: configs.NO_REPLY_EMAIL,
            service: 'gmail',
            auth: {
                user: configs.NO_REPLY_EMAIL,
                pass: configs.NO_REPLY_PASSWORD
            }
        });
        const hbsOptions = {
            viewEngine: {
                extName: ".hbs",
                defaultLayout: "main",
                layoutsDir: path.join(process.cwd(), "src", "templates", "layouts"),
                partialsDir: path.join(process.cwd(), "src", "templates", "partials")
            },
            viewPath: path.join(process.cwd(), "src", "templates", "views"),
            extName: ".hbs"
        }
        this.transporter.use("compile", hbs(hbsOptions));
    }

    public async sendEmail<T extends EmailTypeEnum>(type: T, to: string, context: EmailPayloadType[T]):Promise<void> {
        const {subject, template} = EmailConstants[type];
        context["frontendUrl"] = "http://localhost:5173";
        const emailOptions = {
            to: to,
            subject: subject,
            template: template,
            context: context
        }

        return await this.transporter.sendMail(emailOptions)
    }
}

export const emailService = new EmailService();