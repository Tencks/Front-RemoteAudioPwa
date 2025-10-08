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
  const value = input.valueAsNumber; // ya es number
  this.onSessionVolumeChange(deviceId, sessionID, value);
  }

  toggleSessionMute(deviceID: number, sessionID: string, mute: boolean){
    this.audioService.toggleSessionMute(deviceID, sessionID, mute).subscribe();
  }

}
