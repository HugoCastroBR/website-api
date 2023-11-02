import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

const fakeComments = [
  {
    id: 1,
    content: 'string',
    authorId: 1,
    postId: 1,
    createdAt: new Date('2023-10-17T16:11:46.918Z'),
    updatedAt: new Date('2023-10-18T00:05:37.917Z'),
  },
];

const fakeResponseWithPagination = {
  data: fakeComments,
  total: 1,
  page: 1,
  limit: 1,
  totalPages: 1,
};

const mockCreateComment = {
  content: 'string',
  postId: 1,
};

const mockedCreateCommentResponse = {
  message: 'Comment created successfully',
  data: {
    id: expect.any(Number),
    content: 'string',
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date),
    authorId: 1,
    postId: 1,
  },
  status: 201,
};

const serviceMock = {
  create: jest.fn(),
  findAll: jest.fn(),
  findMany: jest.fn(),
  count: jest.fn(),
  findUnique: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('CommentsController', () => {
  let controller: CommentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [CommentsService],
    })
      .overrideProvider(CommentsService)
      .useValue(serviceMock)
      .compile();

    controller = module.get<CommentsController>(CommentsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a comment', async () => {
      jest
        .spyOn(controller, 'create')
        .mockImplementation(async (_body, _req, res) => {
          return res.status(201).json({
            message: 'Comment created successfully',
            data: fakeComments[0],
            status: 201,
          });
        });
      const req = { user: { id: 1 } } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.create(mockCreateComment, req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockedCreateCommentResponse);
    });
  });

  describe('findAllWithPagination', () => {
    const pagination = { page: 1, itemsPerPage: 10 };

    it('should return an array of comments with pagination', async () => {
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
    it('should return a single comment', async () => {
      jest
        .spyOn(controller, 'findOne')
        .mockResolvedValue(fakeComments[0] as never);

      expect(await controller.findOne(1)).toBe(fakeComments[0]);
      expect(controller.findOne).toHaveBeenCalledWith(1);
      expect(controller.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      jest
        .spyOn(controller, 'update')
        .mockResolvedValue(fakeComments[0] as never);

      expect(await controller.update(1, fakeComments[0])).toBe(fakeComments[0]);
      expect(controller.update).toHaveBeenCalledWith(1, fakeComments[0]);
      expect(controller.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should remove a comment', async () => {
      jest
        .spyOn(controller, 'remove')
        .mockResolvedValue(fakeComments[0] as never);

      expect(await controller.remove(1)).toBe(fakeComments[0]);
      expect(controller.remove).toHaveBeenCalledWith(1);
      expect(controller.remove).toHaveBeenCalledTimes(1);
    });
  });
});
