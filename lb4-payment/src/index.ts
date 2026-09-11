import {ApplicationConfig, Lb4PaymentApplication} from './application';
import {PaymentRepository} from './repositories';
import {startOrderCreatedConsumer} from './queue/rabbitmq-consumer';

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new Lb4PaymentApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  const paymentRepository = await app.getRepository(PaymentRepository);
  await startOrderCreatedConsumer(paymentRepository);

  return app;
}

if (require.main === module) {
  const config = {
    rest: {
      port: +(process.env.PORT ?? 3002),
      host: process.env.HOST,
      gracePeriodForClose: 5000,
      openApiSpec: {
        setServersFromRequest: true,
      },
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
