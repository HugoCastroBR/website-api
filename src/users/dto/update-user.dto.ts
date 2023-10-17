import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    default: false,
    required: false,
  })
  isAdmin?: boolean;

  @ApiProperty({
    default: false,
    required: false,
  })
  name?: string;

  @ApiProperty({
    default: false,
    required: false,
  })
  email?: string;

  @ApiProperty({
    default: false,
    required: false,
  })
  password?: string;
}
