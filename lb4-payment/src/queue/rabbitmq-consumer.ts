import * as amqp from 'amqplib';
import {PaymentRepository} from '../repositories';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const ORDER_CREATED_QUEUE = 'order_created';
const RETRY_DELAY_MS = 3000;

async function connectWithRetry(): Promise<amqp.ChannelModel> {
  while (true) {
    try {
      return await amqp.connect(RABBITMQ_URL);
    } catch (err) {
      console.error(
        `RabbitMQ indisponible, nouvelle tentative dans ${RETRY_DELAY_MS}ms`,
      );
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}

// Consomme les commandes creees pour generer automatiquement
// un paiement "pending", decouple de l'appel HTTP synchrone.
export async function startOrderCreatedConsumer(
  paymentRepository: PaymentRepository,
): Promise<void> {
  const connection = await connectWithRetry();
  const channel = await connection.createChannel();
  await channel.assertQueue(ORDER_CREATED_QUEUE, {durable: true});

  channel.consume(ORDER_CREATED_QUEUE, async (msg: amqp.ConsumeMessage | null) => {
    if (!msg) return;
    try {
      const order = JSON.parse(msg.content.toString());
      await paymentRepository.create({
        orderId: order.id,
        amount: 0,
        status: 'awaiting-payment',
      });
      channel.ack(msg);
    } catch (err) {
      console.error('Echec de traitement du message order_created:', err);
      channel.nack(msg, false, false);
    }
  });

  console.log('En ecoute sur la queue RabbitMQ "order_created"');
}
