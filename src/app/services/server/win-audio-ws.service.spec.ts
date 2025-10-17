import { TestBed } from '@angular/core/testing';

import { WinAudioWSService } from './win-audio-ws.service';

describe('WinAudioWSService', () => {
  let service: WinAudioWSService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WinAudioWSService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
