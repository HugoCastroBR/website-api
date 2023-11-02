import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiProperty({
    required: false,
    default: '',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    required: false,
    default: '',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    required: false,
    default: '',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    required: false,
    default: '',
  })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiProperty({
    required: false,
    default: false,
  })
  @IsString()
  @IsOptional()
  published?: boolean;
}
