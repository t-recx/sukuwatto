import { TestBed } from '@angular/core/testing';

import { UnitsService } from './units.service';

describe('UnitsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UnitsService = TestBed.get(UnitsService);
    expect(service).toBeTruthy();
  });
});
