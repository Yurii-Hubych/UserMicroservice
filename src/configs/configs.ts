import {config} from "dotenv";

config();

export const configs = {
    DB_URL: process.env.DB_URL || "",
    DB_URl_DEV: process.env.DB_URl_DEV || "",
    DB_USER_URL: process.env.DB_USER_URL || "",
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "dfdfdf",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "dfdfdf",
    JWT_SALT: process.env.SECRET_SALT || "10",
    NO_REPLY_PASSWORD: process.env.NO_REPLY_PASSWORD || "",
    NO_REPLY_EMAIL: process.env.NO_REPLY_EMAIL || "",
    JWT_RESET_SECRET: process.env.JWT_RESET_SECRET || "dsadaddassa",
    JWT_ACTIVATE_SECRET: process.env.JWT_ACTIVATE_SECRET || "dsadaddassa",
    PORT_USER_SERVICE: process.env.PORT_USER_SERVICE || "3001",
    CLIENT_ID: process.env.CLIENT_ID || "",
    CLIENT_SECRET: process.env.CLIENT_SECRET || "",
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || "",
}