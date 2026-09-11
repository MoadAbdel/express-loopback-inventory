import * as amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
export const ORDER_CREATED_QUEUE = 'order_created';

let channelPromise: Promise<amqp.Channel> | undefined;

// Reconnexion paresseuse : le channel est recree si la connexion tombe.
function getChannel(): Promise<amqp.Channel> {
  if (!channelPromise) {
    channelPromise = amqp
      .connect(RABBITMQ_URL)
      .then(connection => connection.createChannel())
      .then(async channel => {
        await channel.assertQueue(ORDER_CREATED_QUEUE, {durable: true});
        return channel;
      });
    channelPromise.catch(() => {
      channelPromise = undefined;
    });
  }
  return channelPromise;
}

export async function publishOrderCreated(order: object): Promise<void> {
  try {
    const channel = await getChannel();
    channel.sendToQueue(
      ORDER_CREATED_QUEUE,
      Buffer.from(JSON.stringify(order)),
      {persistent: true},
    );
  } catch (err) {
    // Le message n'est jamais bloquant pour la creation de la commande.
    console.error('Impossible de publier sur RabbitMQ:', err);
  }
}
