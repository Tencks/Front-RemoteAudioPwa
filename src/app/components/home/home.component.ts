import { Component, OnInit } from '@angular/core';
import { AudioDevice } from '../../core/interfaces/AudioInterface';
import { WinAudioService } from '../../services/server/win-audio.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule

  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  devices: AudioDevice[] = [];
  loading = true;

  constructor(private audioService: WinAudioService){}

  ngOnInit(): void {
      this.refresh();
  }

  refresh(){
    this.audioService.getDevices().subscribe({
      next: (data) => {
        this.devices = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  onVolumeChange(deviceID: number, volume: number){
    this.audioService.setDeviceVolume(deviceID, volume / 100).subscribe();
  }

  toggleMute(deviceID: number, mute: boolean){
    this.audioService.toggleDeviceMute(deviceID, mute).subscribe();
  }

  handleVolumeInput(deviceId: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.valueAsNumber; // ya es number
    this.onVolumeChange(deviceId, value);
  }
  

}
