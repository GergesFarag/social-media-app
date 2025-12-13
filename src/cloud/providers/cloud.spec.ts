import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryProvider } from './cloud.provider';

describe('Cloud', () => {
  let provider: typeof CloudinaryProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudinaryProvider],
    }).compile();

    provider = module.get<typeof CloudinaryProvider>('Cloudinary');
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
