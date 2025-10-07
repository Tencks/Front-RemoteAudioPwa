import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AudioDevice } from '../../core/interfaces/AudioInterface';

@Injectable({
  providedIn: 'root'
})
export class WinAudioService {
  private baseUrl = 'http://10.11.21.134:5000'  
  // private baseUrl ='https://10.11.21.134:5000';


  constructor(private http: HttpClient ) { }

  getDevices(): Observable<AudioDevice[]>{
    return this.http.get<AudioDevice[]>(`${this.baseUrl}/devices`)
  }

  setDeviceVolume(id: number, volume: number) {
    return this.http.post(`${this.baseUrl}/device/${id}/volume`, { volume });
  }

  toggleDeviceMute(id: number, mute: boolean) {
    return this.http.post(`${this.baseUrl}/device/${id}/mute`, { mute });
  }

  setSessionVolume(deviceId: number, sessionId: number, volume: number) {
    return this.http.post(`${this.baseUrl}/session/${deviceId}/${sessionId}/volume`, { volume });
  }

  toggleSessionMute(deviceId: number, sessionId: number, mute: boolean) {
    return this.http.post(`${this.baseUrl}/session/${deviceId}/${sessionId}/mute`, { mute });
  }

}
