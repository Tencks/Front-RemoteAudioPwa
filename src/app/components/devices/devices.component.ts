import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AudioDevice, AudioSession } from '../../core/interfaces/AudioInterface';
import { WinAudioService } from '../../services/server/win-audio.service';


@Component({
  selector: 'app-devices',
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './devices.component.html',
  styleUrl: './devices.component.css'
})
export class DevicesComponent implements OnInit{
  devices: AudioDevice[] = [];
  devicesOut: AudioDevice[] = [];
  devicesIn: AudioDevice[] = [];

  sessions: AudioSession[] = [];
  loading = true;

    private isBrowser: boolean = false;
    private Logs: boolean = false;
    

    constructor(
    private audioService: WinAudioService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  ngOnInit(): void {
      this.refresh();

}



    refresh(){
      if(!this.isBrowser){
      this.loading = false;
      return
    }
    this.audioService.getDevices().subscribe({
      next: (data) => {
        this.devices = data.devices;
        if (this.isBrowser) {
          let deviceFilter: any = {};
          try {
            const raw = localStorage.getItem('audioDeviceFilters');
            if (raw) deviceFilter = JSON.parse(raw);
          } catch {
            // Si hay error al leer filtros, continuar sin filtrar
            console.error('Error al leer filtros de localStorage:');
          }

          // Si no hay filtros, pasar todos los dispositivos sin filtrar
          this.devicesOut = data.devices.filter(device => device.type === 0 && (deviceFilter[device.id]?.enabled ?? true));
          this.devicesIn = data.devices.filter(device => device.type === 1 && (deviceFilter[device.id]?.enabled ?? true));

          this.sessions = data.devices.flatMap(device => 
            device.sessions.map(session =>({
              ...session,
              deviceID: device.id, //Identificador del dispositivo
            })));
            if(this.Logs === true){
              console.log(this.sessions);
              console.log(this.devicesOut);
              console.log(this.devicesIn);
            }
        }
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

toggleSessionMute(deviceID: number, sessionID: string, mute: boolean) {
  const sessionIndex = sessionID.split('-')[1] || sessionID; // Fallback si no hay '-'
  console.log('sessionIndex calculado:', sessionIndex);

  console.log('Llamando a toggleSessionMute en audioService con:', {
    deviceID,
    sessionID,
    mute
  });

  this.audioService.toggleSessionMute(deviceID, sessionID, mute).subscribe({
    next: () => {
      console.log('Respuesta exitosa de toggleSessionMute en audioService');

      // Actualizar el estado de la sesión en el modelo de datos
      const device = this.devices.find(d => d.id === deviceID);
      if (!device) {
        console.warn('No se encontró el dispositivo con ID:', deviceID);
      } else {
        console.log('Dispositivo encontrado:', device);
      }

      const session = device?.sessions.find(s => s.id === sessionID);
      if (!session) {
        console.warn('No se encontró la sesión con ID:', sessionID);
      } else {
        console.log('Sesión encontrada antes de actualizar mute:', session);
        session.mute = mute; // Actualizar el estado de mute
        console.log('Sesión actualizada con mute:', session);
      }

      // Forzar la detección de cambios
      console.log('Forzando la detección de cambios');
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Error al mutear/desmutear la sesión:', err);
    }
  });
}

}
