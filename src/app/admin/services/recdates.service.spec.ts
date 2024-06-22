import { TestBed } from '@angular/core/testing';

import { RecdatesService } from './recdates.service';

describe('RecdatesService', () => {
  let service: RecdatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecdatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
