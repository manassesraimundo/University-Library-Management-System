import { Test, TestingModule } from '@nestjs/testing';
import { MembrosService } from './membros.service';

describe('MembrosService', () => {
  let service: MembrosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MembrosService],
    }).compile();

    service = module.get<MembrosService>(MembrosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
