import { Test, TestingModule } from '@nestjs/testing';
import { ImageProcessingServiceService } from './image-processing-service.service';

describe('ImageProcessingServiceService', () => {
  let service: ImageProcessingServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageProcessingServiceService],
    }).compile();

    service = module.get<ImageProcessingServiceService>(ImageProcessingServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
