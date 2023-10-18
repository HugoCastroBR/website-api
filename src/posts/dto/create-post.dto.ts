import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  // @ApiProperty()
  // @IsString()
  // author: string;

  // @ApiProperty()
  // @IsNumber()
  // authorId: number;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({
    required: false,
    default: false,
  })
  @IsString()
  @IsOptional()
  published: boolean;
}
