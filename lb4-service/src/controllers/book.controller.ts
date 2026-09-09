import {repository} from '@loopback/repository';
import {post, get, requestBody} from '@loopback/rest';
import {Book} from '../models';
import {BookRepository} from '../repositories';

export class BookController {
  constructor(
    @repository(BookRepository)
    public bookRepository: BookRepository,
  ) {}

  @post('/books')
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['title', 'author'],
            properties: {
              title: {type: 'string'},
              author: {type: 'string'},
            },
          },
        },
      },
    })
    book: Omit<Book, 'id'>,
  ): Promise<Book> {
    return this.bookRepository.create(book);
  }

  @get('/books')
  async find(): Promise<Book[]> {
    return this.bookRepository.find();
  }
}
