import { TestBed } from '@angular/core/testing';

import { WinAudioService } from './win-audio.service';

describe('WinAudioService', () => {
  let service: WinAudioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WinAudioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
