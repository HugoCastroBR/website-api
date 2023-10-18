// Importe os módulos e dependências necessárias

import { TestingModule, Test } from '@nestjs/testing';
import { PrismaService } from '../database/prisma.service';
import { UsersService } from './users.service';
import { userType } from '../types/users';

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

const fakeResponseWithPagination = {
  data: fakeUsers,
  total: 1,
  page: 1,
  limit: 1,
  totalPages: 1,
};

const prismaMock = {
  user: {
    create: jest.fn().mockResolvedValue(fakeUsers[0]),
    findMany: jest.fn().mockResolvedValue(fakeUsers),
    findUnique: jest.fn().mockResolvedValue(fakeUsers[0]),
    update: jest.fn().mockResolvedValue(fakeUsers[0]),
    delete: jest.fn(),
    count: jest.fn().mockResolvedValue(1),
  },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const response = await service.findAll();
      expect(response).toEqual(fakeUsers);
      expect(prismaMock.user.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAllWithPagination', () => {
    it('should return an array of users with pagination', async () => {
      const response = await service.findAllWithPagination(1, 1);
      expect(response).toEqual(fakeResponseWithPagination);
      expect(prismaMock.user.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return an user', async () => {
      const response = await service.findOne(1);
      expect(response).toEqual(fakeUsers[0]);
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOneByEmail', () => {
    it('should return an user', async () => {
      const response = await service.findOneByEmail('hugo');
      expect(response).toEqual(fakeUsers[0]);
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });
});
