import { actionTokenModel } from "../models/action-token";
import { CronJob } from "cron";
import {actionTokenTypeEnum} from "../enums/action-token-type.enum";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const actionTokensRemover = async () => {
    const sevenDaysAgo = dayjs().subtract(7, "day").toDate();

    /*const actionTokens = await actionTokenModel.find({
        createdAt: { $lt: sevenDaysAgo },
        tokenType: actionTokenTypeEnum.RESET_PASSWORD
    });*/

    await actionTokenModel.deleteMany({createdAt: { $lt: sevenDaysAgo }, tokenType: actionTokenTypeEnum.RESET_PASSWORD})
};
export const removeOldActionTokensHourly = new CronJob("0 * * * *", actionTokensRemover);

export const removeOldActionTokensEverySecond = new CronJob("* * * * * *", actionTokensRemover);
