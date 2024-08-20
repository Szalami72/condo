import { TestBed } from '@angular/core/testing';

import { BboardService } from './bboard.service';

describe('BboardService', () => {
  let service: BboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
