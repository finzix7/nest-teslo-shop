import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {

    @ApiProperty({
        default: 10,
        description: 'Cuantas filas se necesita obtener'
    })
    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    limit?: number;

    @ApiProperty({
        default: 10,
        description: 'Cuantas filas quiere saltarse'
    })
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    offset?: number;
}