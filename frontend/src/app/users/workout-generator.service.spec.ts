import { TestBed } from '@angular/core/testing';

import { WorkoutGeneratorService } from './workout-generator.service';

describe('WorkoutGeneratorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WorkoutGeneratorService = TestBed.get(WorkoutGeneratorService);
    expect(service).toBeTruthy();
  });
});
