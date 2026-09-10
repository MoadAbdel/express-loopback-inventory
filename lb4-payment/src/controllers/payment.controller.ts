import {repository} from '@loopback/repository';
import {post, get, requestBody} from '@loopback/rest';
import {Payment} from '../models';
import {PaymentRepository} from '../repositories';

export class PaymentController {
  constructor(
    @repository(PaymentRepository)
    public paymentRepository: PaymentRepository,
  ) {}

  @post('/payments')
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['orderId', 'amount'],
            properties: {
              orderId: {type: 'string'},
              amount: {type: 'number'},
              status: {type: 'string'},
            },
          },
        },
      },
    })
    payment: Omit<Payment, 'id'>,
  ): Promise<Payment> {
    return this.paymentRepository.create(payment);
  }

  @get('/payments')
  async find(): Promise<Payment[]> {
    return this.paymentRepository.find();
  }
}
