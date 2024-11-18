import {rabbitMQ} from "./index";

export const initializeQueues = async (): Promise<void> => {
    try {
        await rabbitMQ.createQueue("deleteUser");
        await rabbitMQ.createQueue("registerUser");
        await rabbitMQ.createQueue("asignRoleToUser");
        await rabbitMQ.createQueue("blockUser");
        await rabbitMQ.createQueue("unblockUser");
    } catch (error) {
        console.error(error);
    }
}