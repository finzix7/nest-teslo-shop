import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../auth/entities/user.entity';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(

    private readonly productService: ProductsService,

    @InjectRepository(User)
    private readonly userRepositiry: Repository<User>,

  ) { }

  async runSeed() {

    await this.deteleTables();

    const adminUser = await this.insertUsers();

    await this.insertNewProducts(adminUser);

    return `SEED EXECUTED`;
  }

  private async deteleTables() {

    await this.productService.deleteAllProducts();

    const queryBuilder = this.userRepositiry.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute();
  }

  private async insertUsers() {
    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach(user => {
      users.push(this.userRepositiry.create(user))
    });

    const dbUsers = await this.userRepositiry.save(seedUsers);

    return dbUsers[0];
  }

  private async insertNewProducts(user: User) {
    await this.productService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach(product => {
      insertPromises.push(this.productService.create(product, user));
    });

    await Promise.all(insertPromises);

    return true;
  }
}
