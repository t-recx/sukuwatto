import { TestBed } from '@angular/core/testing';

import { UserBioDataService } from './user-bio-data.service';

describe('UserBioDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UserBioDataService = TestBed.get(UserBioDataService);
    expect(service).toBeTruthy();
  });
});
