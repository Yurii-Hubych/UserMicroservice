import express, {Request, Response, NextFunction} from 'express';
import * as mongoose from "mongoose";
import {configs} from "./configs/configs";
import {ApiError} from "./errors/api.error";
import {authRouter} from "./routers/auth.router";
import {roleRouter} from "./routers/role.router";
import {userRouter} from "./routers/user.router";
import {cronRunner} from "./crons";
import {rabbitMQ} from "./rabbitMQ";
import {initializeQueues} from "./rabbitMQ/initializeQueues";


const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
const port = 3001;

app.use("/auth", authRouter);
app.use("/roles", roleRouter);
app.use("/users", userRouter);

app.use((err: ApiError, req: Request, res: Response, next: NextFunction) => {
    const status: number = err.status || 500;
    res.status(status).json({message: err.message});
})

process.on("SIGINT", () => {
    rabbitMQ.close();
    process.exit();
})

app.listen(port, async () => {
    await mongoose.connect(configs.DB_URl_DEV);
    cronRunner();
    await rabbitMQ.connect();
    await initializeQueues();
    console.log(`Server listening on port ${configs.PORT_USER_SERVICE}`);
})

