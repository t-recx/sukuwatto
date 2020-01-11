import { TestBed } from '@angular/core/testing';

import { LastMessagesService } from './last-messages.service';

describe('LastMessagesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LastMessagesService = TestBed.get(LastMessagesService);
    expect(service).toBeTruthy();
  });
});
