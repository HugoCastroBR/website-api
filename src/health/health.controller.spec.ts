import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  HealthCheckService,
  HttpHealthIndicator,
  TerminusModule,
} from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;
  const healthCheckServiceMock = {
    check: jest.fn(),
  };
  const httpHealthIndicatorMock = {
    pingCheck: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: healthCheckServiceMock,
        },
        {
          provide: HttpHealthIndicator,
          useValue: httpHealthIndicatorMock,
        },
      ],
      imports: [TerminusModule],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  describe('check', () => {
    it('should return the result of health checks', async () => {
      const healthCheckResult = {
        status: 'ok',
        info: {
          'nestjs-docs': {
            status: 'up',
          },
        },
        error: {},
        details: {
          'nestjs-docs': {
            status: 'up',
          },
        },
      };

      healthCheckServiceMock.check.mockResolvedValue(healthCheckResult);

      const result = await controller.check();

      expect(result).toEqual(healthCheckResult);

      expect(healthCheckServiceMock.check).toHaveBeenCalledWith([
        expect.any(Function),
      ]);
    });
  });
});
