import { Test, TestingModule } from '@nestjs/testing';
import { ImageProcessingControllerController } from './image-processing-controller.controller';

describe('ImageProcessingControllerController', () => {
  let controller: ImageProcessingControllerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImageProcessingControllerController],
    }).compile();

    controller = module.get<ImageProcessingControllerController>(ImageProcessingControllerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
