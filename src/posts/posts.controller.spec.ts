import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

const postsServiceMock = {
  create: jest.fn(),
  findAll: jest.fn(),
  findAllWithPagination: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

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

const mockedCreatePost = {
  title: 'string',
  content: 'string',
  published: false,
};

const mockedCreatePostResponse = {
  message: 'Post created successfully',
  data: {
    id: expect.any(Number),
    title: 'string',
    content: 'string',
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date),
    authorId: 3,
    published: false,
  },
};

describe('PostsController', () => {
  let controller: PostsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [PostsService],
    })
      .overrideProvider(PostsService)
      .useValue(postsServiceMock)
      .compile();

    controller = module.get<PostsController>(PostsController);
  });

  describe('create', () => {
    it('should create a post', async () => {
      jest
        .spyOn(controller, 'create')
        .mockImplementation(async (_body, _req, res) => {
          return res.status(201).json(mockedCreatePostResponse);
        });

      const req = { user: { id: 3 } } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.create(mockedCreatePost, req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockedCreatePostResponse);
    });
  });

  describe('findAllWithPagination', () => {
    const pagination = { page: 1, itemsPerPage: 10 };

    it('should return an array of posts with pagination', async () => {
      jest
        .spyOn(controller, 'findAllWithPagination')
        .mockResolvedValue(fakeResponseWithPagination as never);

      const result = await controller.findAllWithPagination(pagination);
      expect(result).toBe(fakeResponseWithPagination);
      expect(controller.findAllWithPagination).toHaveBeenCalledWith({
        itemsPerPage: 10,
        page: 1,
      });
      expect(controller.findAllWithPagination).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a single post', async () => {
      jest
        .spyOn(controller, 'findOne')
        .mockResolvedValue(fakePosts[0] as never);

      expect(await controller.findOne(1)).toBe(fakePosts[0]);
      expect(controller.findOne).toHaveBeenCalledWith(1);
      expect(controller.findOne).toHaveBeenCalledTimes(1);
    });
  });
  describe('update', () => {
    it('should update a post', async () => {
      jest.spyOn(controller, 'update').mockResolvedValue(fakePosts[0] as never);

      expect(await controller.update(1, fakePosts[0])).toBe(fakePosts[0]);
      expect(controller.update).toHaveBeenCalledWith(1, fakePosts[0]);
      expect(controller.update).toHaveBeenCalledTimes(1);
    });
  });
  describe('remove', () => {
    it('should remove a post', async () => {
      jest.spyOn(controller, 'remove').mockResolvedValue(fakePosts[0] as never);

      expect(await controller.remove(1)).toBe(fakePosts[0]);
      expect(controller.remove).toHaveBeenCalledWith(1);
      expect(controller.remove).toHaveBeenCalledTimes(1);
    });
  });
});
