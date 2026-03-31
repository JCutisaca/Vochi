import { Test, TestingModule } from '@nestjs/testing';
import { ValidateJobController } from './validate-job.controller';

describe('ValidateJobController', () => {
  let controller: ValidateJobController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ValidateJobController],
    }).compile();

    controller = module.get<ValidateJobController>(ValidateJobController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
