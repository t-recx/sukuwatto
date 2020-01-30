import { TestBed } from '@angular/core/testing';

import { StreamsService } from './streams.service';

describe('StreamsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StreamsService = TestBed.get(StreamsService);
    expect(service).toBeTruthy();
  });
});
