import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    required: false,
    default: false,
  })
  @IsString()
  @IsOptional()
  published?: boolean;
}
