import { TestBed } from '@angular/core/testing';

import { WorkoutsService } from './workouts.service';

describe('WorkoutsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WorkoutsService = TestBed.get(WorkoutsService);
    expect(service).toBeTruthy();
  });
});
