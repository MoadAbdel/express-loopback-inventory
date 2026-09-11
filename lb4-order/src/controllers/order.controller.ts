import {repository} from '@loopback/repository';
import {post, get, requestBody} from '@loopback/rest';
import {Order} from '../models';
import {OrderRepository} from '../repositories';
import {publishOrderCreated} from '../queue/rabbitmq';

export class OrderController {
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
  ) {}

  @post('/orders')
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['product', 'quantity'],
            properties: {
              product: {type: 'string'},
              quantity: {type: 'number'},
              status: {type: 'string'},
            },
          },
        },
      },
    })
    order: Omit<Order, 'id'>,
  ): Promise<Order> {
    const created = await this.orderRepository.create(order);
    // Le paiement est traite de facon asynchrone par le
    // microservice payment, decouple via RabbitMQ.
    await publishOrderCreated(created);
    return created;
  }

  @get('/orders')
  async find(): Promise<Order[]> {
    return this.orderRepository.find();
  }
}
