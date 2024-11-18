import { removeOldActionTokensHourly} from "./remove-old-action-tokens.cron";

export const cronRunner = () => {
    removeOldActionTokensHourly.start();
}