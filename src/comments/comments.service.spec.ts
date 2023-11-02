import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { PrismaService } from '../database/prisma.service';

const fakeComments = [
  {
    id: 1,
    content: 'string',
    authorId: 1,
    postId: 1,
    createdAt: new Date('2023-10-17T16:11:46.918Z'),
    updatedAt: new Date('2023-10-18T00:05:37.917Z'),
  },
  {
    id: 25,
    content: 'string',
    createdAt: '2023-10-21T02:12:48.093Z',
    updatedAt: '2023-10-21T02:12:48.093Z',
    authorId: 3,
    postId: 1,
  },
];

const fakeResponseWithPagination = {
  data: fakeComments,
  total: 1,
  page: 1,
  limit: 1,
  totalPages: 1,
};

const serviceMock = {
  comments: {
    create: jest.fn().mockResolvedValue(fakeComments[0]),
    findAll: jest.fn(),
    findMany: jest.fn().mockResolvedValue(fakeComments),
    count: jest.fn().mockResolvedValue(1),
    findUnique: jest.fn().mockResolvedValue(fakeComments[1]),
    update: jest.fn().mockResolvedValue(fakeComments[0]),
    delete: jest.fn(),
  },
};

describe('CommentsService', () => {
  let service: CommentsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: PrismaService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new comment', async () => {
      const response = await service.create(
        { content: 'string', postId: 1 },
        1,
      );

      expect(response).toEqual({
        id: expect.any(Number),
        content: 'string',
        authorId: 1,
        postId: 1,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(serviceMock.comments.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAllWithPagination', () => {
    it('should return all comments with pagination', async () => {
      const response = await service.findAllWithPagination(1, 1);
      expect(response).toEqual(fakeResponseWithPagination);
      expect(serviceMock.comments.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a comment by id', async () => {
      const response = await service.findOne(25);
      expect(response).toEqual(fakeComments[1]);
      expect(serviceMock.comments.findUnique).toHaveBeenCalledTimes(1);
      expect(serviceMock.comments.findUnique).toHaveBeenCalledWith({
        where: { id: 25 },
      });
    });
  });

  describe('update', () => {
    it('should update a comment by id', async () => {
      const response = await service.update(1, {
        content: 'string',
      });
      expect(response).toEqual(fakeComments[0]);
      expect(serviceMock.comments.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('should delete a comment by id', async () => {
      const response = await service.remove(1);
      expect(response).toEqual('Comment deleted successfully');
      expect(serviceMock.comments.delete).toHaveBeenCalledTimes(1);
      expect(serviceMock.comments.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
