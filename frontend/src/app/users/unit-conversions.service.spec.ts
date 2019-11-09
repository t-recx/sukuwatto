import { TestBed } from '@angular/core/testing';

import { UnitConversionsService } from './unit-conversions.service';

describe('UnitConversionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UnitConversionsService = TestBed.get(UnitConversionsService);
    expect(service).toBeTruthy();
  });
});
