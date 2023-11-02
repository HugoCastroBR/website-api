import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { userType } from 'src/types/users';

const usersServiceMock = {
  findAllWithPagination: jest.fn(),
  findOne: jest.fn(),
};

const fakeUsers: userType[] = [
  {
    id: 1,
    email: 'hugo',
    name: 'John Doe',
    password: '$2b$10$3ynaPKkX.WpNXRI2sM8al.TrJayLr2NA80vbe3yKUR567vklduApm',
    isAdmin: true,
    createdAt: new Date('2023-10-17T16:11:46.918Z'),
    updatedAt: new Date('2023-10-18T00:05:37.917Z'),
  },
];

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(usersServiceMock)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of users with pagination', async () => {
      const pagination = { page: 1, itemsPerPage: 10 };

      usersServiceMock.findAllWithPagination.mockResolvedValue(fakeUsers);

      const result = await controller.findAll(pagination);
      expect(result).toEqual(fakeUsers);
      expect(usersServiceMock.findAllWithPagination).toHaveBeenCalledWith(
        pagination.page,
        pagination.itemsPerPage,
      );
    });
  });

  describe('findOne', () => {
    it('should return a single user by ID', async () => {
      const userId = 1;

      usersServiceMock.findOne.mockResolvedValue(fakeUsers[0]);

      const result = await controller.findOne(1);
      expect(result).toEqual(fakeUsers[0]);
      expect(usersServiceMock.findOne).toHaveBeenCalledWith(userId);
    });
  });
});
