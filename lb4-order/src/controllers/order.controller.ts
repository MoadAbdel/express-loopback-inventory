import {repository} from '@loopback/repository';
import {post, get, requestBody} from '@loopback/rest';
import {Order} from '../models';
import {OrderRepository} from '../repositories';

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
    return this.orderRepository.create(order);
  }

  @get('/orders')
  async find(): Promise<Order[]> {
    return this.orderRepository.find();
  }
}
