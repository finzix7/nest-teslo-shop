import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsIn, IsInt, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreateProductDto {

    @ApiProperty({
        description: 'Titulo de producto (unico)',
        nullable: false,
        minLength: 1,
    })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiProperty({
        description: 'Precio del producto',
        nullable: true,
        minimum: 1,
    })
    @IsInt()
    @IsPositive()
    @IsOptional()
    price?: number

    @ApiProperty({
        description: 'Descripción de producto',
        nullable: true,
        minLength: 1,
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'Descripción de producto',
        nullable: true,
        minLength: 1,
    })
    @IsString()
    @IsOptional()
    slug?: string;

    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @IsString({ each: true })
    @IsArray()
    sizes: string[];

    @IsIn(['men', 'women', 'kid', 'unisex'])
    gender: string;

    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    tags: string[];

    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    images?: string[];
}
