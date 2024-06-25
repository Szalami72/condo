import { TestBed } from '@angular/core/testing';

import { CostserviceService } from './costs.service';

describe('CostserviceService', () => {
  let service: CostserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CostserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
