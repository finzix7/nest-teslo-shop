import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { validate as isUUID } from 'uuid';
import { Product, ProductImage } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,

  ) { }

  async create(createProductDto: CreateProductDto, user: User) {

    try {

      const { images = [], ...propertiesProduct } = createProductDto;

      const product = this.productRepository.create({
        ...propertiesProduct,
        images: images.map(image => this.productImageRepository.create({ url: image })),
        user,
      });
      await this.productRepository.save(product);

      return { ...product, images };

    } catch (error) {
      this.handleDBException(error);
    }

  }

  async findAll(paginationDto: PaginationDto) {

    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      //relaciones
      relations: {
        images: true,
      }
    });

    return products.map(product => ({
      ...product,
      images: product.images.map(img => img.url)
    }));

  }

  async findOne(term: string) {

    let product: Product;

    if (isUUID(term))
      product = await this.productRepository.findOneBy({ id: term });
    else {
      //se realiza una query tipo SQL
      // para el caso del join se agrega un alias para hacer la referencia a la tabla que se desea hacer un join
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (!product)
      throw new NotFoundException(`No se encuentra el producto: ${term}`);

    return product;
  }

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);

    return {
      ...rest,
      images: images.map(image => image.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {

    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({ id, ...toUpdate });

    if (!product) throw new NotFoundException(`El producto con ID: ${id} no existe`);

    //se crea query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });

        product.images = images.map(
          image => this.productImageRepository.create({ url: image })
        );
      }

      product.user = user;

      await queryRunner.manager.save(product);
      // await this.productRepository.save(product);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(product.id);


    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBException(error);
    }

  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);

    // if (affected === 0) {
    //   throw new BadRequestException(`No exite el producto: ${id}`);
    // }

    return;
  }

  private handleDBException(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException('Error no esperado, revisar log en servidor');
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query
        .delete()
        .where({})
        .execute();

    } catch (error) {
      this.handleDBException(error);
    }

  }
}
