import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { AudioDevice } from '../../core/interfaces/AudioInterface';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class WinAudioService {
 private baseUrl: string;


  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    //valor por defecto
    this.baseUrl = 'http://localhost:5000';
    //Ejecutamos solo si es en navegador
    if(isPlatformBrowser(this.platformId)){
      const hostname = window.location.hostname;
        this.baseUrl = hostname  === 'localhost' || hostname === '127.0.0.1' 
          ? 'http://localhost:5000' : `http://${hostname}:5000`;
    }
    
    
   }

  getDevices(): Observable<AudioDevice[]>{
    return this.http.get<AudioDevice[]>(`${this.baseUrl}/devices`)
  }

  setDeviceVolume(id: number, volume: number) {
    return this.http.post(`${this.baseUrl}/device/${id}/volume`, { volume });
  }

  toggleDeviceMute(id: number, mute: boolean) {
    return this.http.post(`${this.baseUrl}/device/${id}/mute`, { mute });
  }

  setSessionVolume(deviceId: number, sessionId: string, volume: number) {
    return this.http.post(`${this.baseUrl}/session/${deviceId}/${sessionId}/volume`, { volume });
  }

  toggleSessionMute(deviceId: number, sessionId: string, mute: boolean) {
    return this.http.post(`${this.baseUrl}/session/${deviceId}/${sessionId}/mute`, { mute });
  }

}
