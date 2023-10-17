import { ApiProperty } from '@nestjs/swagger';

export class PaginationDTO {
  @ApiProperty({
    type: Number,
    default: 1,
  })
  page: number;

  @ApiProperty({
    type: Number,
    default: 10,
  })
  itemsPerPage: number;
}
