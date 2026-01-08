import { Test, TestingModule } from '@nestjs/testing';
import { MembrosController } from './membros.controller';

describe('MembrosController', () => {
  let controller: MembrosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembrosController],
    }).compile();

    controller = module.get<MembrosController>(MembrosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
