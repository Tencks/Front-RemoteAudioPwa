import { Component, OnInit } from '@angular/core';
import { AudioDevice, AudioSession } from '../../core/interfaces/AudioInterface';
import { WinAudioService } from '../../services/server/win-audio.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  devices: AudioDevice[] = [];
  sessions: AudioSession[] = [];
  loading = true;

  constructor(private audioService: WinAudioService){}

  ngOnInit(): void {
      this.refresh();
  }

  refresh(){
    this.audioService.getDevices().subscribe({
      next: (data) => {
        this.devices = data;
        this.sessions = data.flatMap(device => 
          device.sessions.map(session =>({
            ...session,
            deviceID: device.id, //Identificador del dispositivo
          })));
        console.log(this.sessions);
        
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  onVolumeChange(deviceID: number, volume: number){
  const normalizedVolume = volume / 100;
  this.audioService.setDeviceVolume(deviceID, normalizedVolume).subscribe({
    next: () => {
      // Actualizar el dispositivo en la interfaz
      const device = this.devices.find(d => d.id === deviceID);
      if (device) {
        device.volume = normalizedVolume;
      }
    }
  });
}

  toggleMute(deviceID: number, mute: boolean){
    this.audioService.toggleDeviceMute(deviceID, mute).subscribe();
  }

  handleVolumeInput(deviceId: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.valueAsNumber; // ya es number
    this.onVolumeChange(deviceId, value);
  }

  //Metodos para las sessions
  onSessionVolumeChange(deviceID: number, sessionID: string, volume: number) {
      // Debug: Mostrar todos los valores antes de enviar
    // console.log('=== DEBUG CAMBIO VOLUMEN SESIÓN ===');
    // console.log('Device ID:', deviceID);
    // console.log('Session ID completo:', sessionID);
    // console.log('Volumen (0-1):', volume);
    // console.log('Volumen (%):', Math.round(volume * 100) + '%');
    // console.log('=====================================');
     const normalizedVolume = volume / 100;
     this.audioService.setSessionVolume(deviceID, sessionID, normalizedVolume).subscribe({
      next: () => {
        // Actualizar la sesión en la interfaz
        const session = this.sessions.find(s => s.id === sessionID && s.deviceID === deviceID);
        if (session) {
          session.volume = normalizedVolume;
        }
      }
     });
  }

  handleSessionVolumeInput(deviceId: number, sessionID: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.valueAsNumber; // valor de 0-100
    
    // Actualizar el modelo en tiempo real para que se actualice el porcentaje
    const device = this.devices.find(d => d.id === deviceId);
    const session = device?.sessions.find(s => s.id === sessionID);
    if (session) {
      session.volume = value / 100; // convertir a 0-1 y actualizar modelo
    }
    
    this.onSessionVolumeChange(deviceId, sessionID, value); // pasar el valor 0-100 al servidor
  }
  // Método auxiliar para extraer el índice de la sesión
  getSessionIndex(sessionID: string): string {
    return sessionID.split('-')[1] || sessionID;
  }
  toggleSessionMute(deviceID: number, sessionID: string, mute: boolean){

    const sessionIndex = sessionID.split('-')[1] || sessionID; //Fallback si no hay '-' 
    
    this.audioService.toggleSessionMute(deviceID, sessionID, mute).subscribe();
  }

}
