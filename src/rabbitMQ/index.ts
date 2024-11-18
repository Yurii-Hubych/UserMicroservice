import amqp from 'amqplib';

class RabbitMQ {
    private connection: amqp.Connection | null = null;
    private channel: amqp.Channel | null = null;

    async connect() {
        try {
            //this.connection = await amqp.connect('amqp://message-broker');
            this.connection = await amqp.connect('amqp://localhost');
            this.channel = await this.connection.createChannel();
            console.log("Connected to RabbitMQ");
        } catch (error) {
            console.error("Failed to connect to RabbitMQ", error);
        }
    }

    async createQueue(queueName: string) {
        if (this.channel) {
            await this.channel.assertQueue(queueName, { durable: true });
        } else {
            console.error("Channel not initialized");
        }
    }

    sendMessage(queueName: string, message: string) {
        if (this.channel) {
            const messageBuffer = Buffer.from(message);
            this.channel.sendToQueue(queueName, messageBuffer, { persistent: true });
        } else {
            console.error("Channel not initialized");
        }
    }

    close() {
        if (this.connection) {
            this.connection.close();
            console.log("RabbitMQ connection closed");
        }
    }
}

// Export a single instance to use across the application
export const rabbitMQ = new RabbitMQ();
