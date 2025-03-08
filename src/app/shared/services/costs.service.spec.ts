import { TestBed } from '@angular/core/testing';

import { CostsService } from './costs.service';
describe('CostserviceService', () => {
  let service: CostsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CostsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
