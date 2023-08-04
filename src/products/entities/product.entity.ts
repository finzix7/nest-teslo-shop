import { ApiProperty } from "@nestjs/swagger";
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { User } from "src/auth/entities/user.entity";
import { ProductImage } from '.';

@Entity({ name: 'products' })
export class Product {

    @ApiProperty({
        example: '4cded552-d1ea-4d88-8557-87f0bbfcf199',
        description: 'Product ID',
        uniqueItems: true,
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'Titulo Teslo',
        description: 'Product Title',
        uniqueItems: true,
    })
    @Column('text', {
        unique: true,
    })
    title: string;

    @ApiProperty({
        example: 1000,
        description: 'Product Price',
    })
    @Column('int', {
        default: 0
    })
    price: number;

    @ApiProperty({
        example: 'Esta es una descripción del producto',
        description: 'Product Description',
    })
    @Column({
        type: 'text',
        nullable: true,
    })
    description: string;

    @ApiProperty({
        example: 'titulo_teslo',
        description: 'Product Slug',
        uniqueItems: true,
    })
    @Column('text', {
        unique: true,
    })
    slug: string;

    @ApiProperty({
        example: 3,
        description: 'Product Stock',
        uniqueItems: true,
    })
    @Column('int', {
        default: 0,
    })
    stock: number;

    @ApiProperty({
        example: ['S', 'M', 'XL'],
        description: 'Product Sizes',
    })
    @Column('text', {
        array: true,
    })
    sizes: string[];

    @ApiProperty({
        example: 'men',
        description: 'Product Gender',
        uniqueItems: true,
    })
    @Column('text')
    gender: string;

    @ApiProperty({
        example: ['Polera', 'Pantalon', 'Niños'],
        description: 'Product tags',
    })
    @Column('text', {
        array: true,
        default: [],
    })
    tags: string[];

    @ApiProperty({
        example: ['image.jpg', 'image2.png'],
        description: 'Product Image',
    })
    @OneToMany(
        () => ProductImage,
        productImage => productImage.product,
        { cascade: true, eager: true },
    )

    images?: ProductImage[];

    @ManyToOne(
        () => User,
        (user) => user.product,
        { eager: true }
    )
    user: User;

    @BeforeInsert()
    checkSlugInsert() {

        if (!this.slug) {
            this.slug = this.title;
        }

        this.slug = this.slug
            .toLocaleLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '');
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug
            .toLocaleLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '');
    }
}
