import { Injectable } from '@nestjs/common';

@Injectable()
export class ArticlesService {
  findAll() {
    return [
      {
        id: 1,
        title: 'My first article',
        description: 'Learning NestJS',
      },
      {
        id: 2,
        title: 'Angular to Full Stack',
        description: 'Building a backend with NestJS',
      },
    ];
  }
}
