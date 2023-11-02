import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({
    required: false,
    default: '',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    default: 'No subtitle',
  })
  @IsString()
  subtitle: string;

  @ApiProperty({
    default: false,
  })
  @IsString()
  @IsOptional()
  published?: boolean;
}
