import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/database/prisma.service';
import { userType } from 'src/types/users';

const fakeUsers: userType[] = [
  {
    id: 1,
    name: 'Teste',
    email: 'teste@email.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    isAdmin: false,
    password: '123456',
  },
];

const prismaMock = {
  post: {
    // create: jest.fn().mockReturnValue(fakeUsers[0]),
    findMany: jest.fn().mockResolvedValue(fakeUsers),
    // findUnique: jest.fn().mockResolvedValue(fakeUsers[0]),
    // update: jest.fn().mockResolvedValue(fakeUsers[0]),
    // delete: jest.fn(), // O método delete não retorna nada
  },
};

describe('UsersController', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it(`should return an array of posts`, async () => {
      const response = await service.findAll();
      console.log(response);
      expect(response).toEqual(fakeUsers);
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.user.findMany).toHaveBeenCalledWith(/* nothing */);
    });
  });
});
