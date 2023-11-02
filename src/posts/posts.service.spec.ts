import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PrismaService } from '../database/prisma.service';
import { UpdatePostDto } from './dto/update-post.dto';

const fakePosts = [
  {
    id: 1,
    title: 'Post 1',
    content: 'Lorem ipsum dolor sit amet',
    published: true,
    authorId: 1,
    createdAt: new Date('2023-10-17T16:11:46.918Z'),
    updatedAt: new Date('2023-10-18T00:05:37.917Z'),
  },
];

const fakeResponseWithPagination = {
  data: fakePosts,
  total: 1,
  page: 1,
  limit: 1,
  totalPages: 1,
};

describe('PostsService', () => {
  let service: PostsService;
  let prismaService: PrismaService;

  const prismaMock = {
    post: {
      create: jest.fn().mockResolvedValue(fakePosts[0]),
      findMany: jest.fn().mockResolvedValue(fakePosts),
      findUnique: jest.fn().mockResolvedValue(fakePosts[0]),
      update: jest.fn().mockResolvedValue(fakePosts[0]),
      delete: jest.fn(),
      count: jest.fn().mockResolvedValue(1),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new post', async () => {
      const response = await service.create(fakePosts[0], {} as any, 0);

      expect(response).toEqual({
        id: 1,
        title: fakePosts[0].title,
        content: fakePosts[0].content,
        authorId: 1,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        published: true,
      });

      // Verifica se a função create do PrismaService foi chamada com os parâmetros corretos
      expect(prismaService.post.create).toHaveBeenCalledTimes(1);
      expect(prismaService.post.create).toHaveBeenCalledWith({
        data: {
          author: {
            connect: {
              id: 0,
            },
          },
          authorId: 1,
          content: 'Lorem ipsum dolor sit amet',
          createdAt: new Date('2023-10-17T16:11:46.918Z'),
          id: 1,
          published: true,
          title: 'Post 1',
          updatedAt: new Date('2023-10-18T00:05:37.917Z'),
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of posts', async () => {
      const response = await service.findAll();
      expect(response).toEqual(fakePosts);
      expect(prismaMock.post.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAllWithPagination', () => {
    it('should return an array of posts with pagination', async () => {
      const response = await service.findAllWithPagination(1, 1);
      expect(response).toEqual(fakeResponseWithPagination);
      expect(prismaMock.post.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a single post by ID', async () => {
      const postId = 1;
      const response = await service.findOne(postId);
      expect(response).toEqual(fakePosts[0]);
      expect(prismaMock.post.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId },
      });
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const postId = 1; // You should replace this with an existing post ID.
      const updatePostDto: UpdatePostDto = {
        title: 'Updated Title',
        content: 'Updated Content',
        published: true,
      };

      const response = await service.update(postId, updatePostDto);

      // Replace the expected result with the expected behavior of your service.
      expect(response).toEqual({
        authorId: 1,
        content: 'Lorem ipsum dolor sit amet',
        createdAt: expect.any(Date),
        id: 1,
        published: true,
        title: 'Post 1',
        updatedAt: expect.any(Date),
      });
      expect(prismaMock.post.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should remove a post', async () => {
      const postId = 1; // You should replace this with an existing post ID.

      const response = await service.remove(postId);

      // Replace the expected result with the expected behavior of your service.
      expect(response).toEqual(`Post deleted successfully`);
    });
  });
});
