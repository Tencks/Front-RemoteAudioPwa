import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { AudioDevice, DevicesResponse, MediaInfo } from '../../core/interfaces/AudioInterface';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class WinAudioService {
private baseUrl: string;
private hostname: string = ''; //Obtenemos solo la parte del hostname sin el puerto

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    this.baseUrl = '/api';
    //Ejecutamos solo si es en navegador
    if(isPlatformBrowser(this.platformId)){
      this.hostname =window.location.hostname.replace(/:\d+$/, '')
        this.baseUrl = '/api';
    }
    
    
   }

  getDevices(): Observable<DevicesResponse>{
    // console.log(this.hostname);
    return this.http.get<DevicesResponse>(`${this.baseUrl}/${this.hostname}/devices`)
  }

  setDeviceVolume(id: number, volume: number) {
    // console.log('volumen a setear',volume)
    return this.http.post(`${this.baseUrl}/${this.hostname}/device/${id}/volume`, { volume });
  }

  toggleDeviceMute(id: number, mute: boolean) {
    return this.http.post(`${this.baseUrl}/${this.hostname}/device/${id}/mute`, { mute });
  }

  setSessionVolume(deviceId: number, sessionId: string, volume: number) {
    //Extraemos el sessionID
    const sessinIndex = sessionId.split('-')[1] || sessionId; //Fallback sui no hay '-' 
    console.log(sessinIndex);
    const url = `${this.baseUrl}/${this.hostname}/session/${deviceId}/${sessinIndex}/volume`;
     // Debug: Mostrar URL construida
    // console.log('=== DEBUG SERVICIO ===');
    // console.log('Session ID original:', sessionId);
    // console.log('Session ID extraído:', sessinIndex);
    // console.log('URL completa:', url);
    // console.log('Volumen a enviar:', volume);
    // console.log('======================');
   return this.http.post(url, { volume });
  }

  toggleSessionMute(deviceId: number, sessionId: string, mute: boolean) {
    //Extraemos el sessionID
    const sessionIndex = sessionId.split('-')[1] || sessionId; //Fallback si no hay '-' 
    const url = `${this.baseUrl}/${this.hostname}/session/${deviceId}/${sessionIndex}/mute`;
     // Debug: Mostrar URL construida
    // console.log('=== DEBUG TOGGLE MUTE SERVICIO ===');
    // console.log('Session ID original:', sessionId);
    // console.log('Session ID extraído:', sessionIndex);
    // console.log('URL completa:', url);
    // console.log('Mute:', mute);
    // console.log('==================================');
    
    return this.http.post(url, { mute });
  }

  MusicPlayPause() {
    return this.http.post(`${this.baseUrl}/${this.hostname}/media/playpause`, {});
  }
  MusicPrevious() {
    return this.http.post(`${this.baseUrl}/${this.hostname}/media/prev`, {});
  }
  MusicNext() {
    return this.http.post(`${this.baseUrl}/${this.hostname}/media/next`, {});
  }

  MusicCurrent():Observable<MediaInfo[]> {
    return this.http.get<MediaInfo[]>(`${this.baseUrl}/${this.hostname}/media/status/${this.hostname}`);
  }

}
