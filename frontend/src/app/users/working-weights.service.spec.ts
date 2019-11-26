import { TestBed } from '@angular/core/testing';

import { WorkingWeightsService } from './working-weights.service';

describe('WorkingWeightsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WorkingWeightsService = TestBed.get(WorkingWeightsService);
    expect(service).toBeTruthy();
  });
});
