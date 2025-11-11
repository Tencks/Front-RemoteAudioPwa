import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID, NgZone, viewChild, ViewChild, ElementRef } from '@angular/core';
import { WinAudioService } from '../../services/server/win-audio.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { mediaInfo, MediaInfoData } from '../../core/interfaces/AudioInterface';
import {  Subscription } from 'rxjs';
import { WinAudioWSService } from '../../services/server/win-audio-ws.service';

// Define una interfaz para la información de la canción que se usará en Media Session
interface SongInfo {
  title: string;
  artist: string;
  album: string;
  artwork: MediaImage[];
}

@Component({
  selector: 'app-general-sound',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './general-sound.component.html',
  styleUrl: './general-sound.component.css'
})
export class GeneralSoundComponent implements OnInit, OnDestroy {
  @ViewChild('mediaElement') mediaElementRef!:ElementRef<HTMLAudioElement>;

  showUwu: boolean = false; // Estado para mostrar u ocultar "UwU"
  private hideTimeout: any; // Variable para manejar el timeout
  currentSong: MediaInfoData[] = [];
  private mediaUpdateSubscription: Subscription | undefined;
  progressInterval: any; // Para almacenar el ID del intervalo de progreso
  private serverId : string = '';
  currentMediaInfo: any | null = null;
  isConnected: boolean = false;
  private mediaSubscription!: Subscription;
  websocketUrl:string = '';
  private Logs: boolean = true;

  //variables para ProgressBar LocalStorage
  private lastPosition: number = 0;
  
  
  constructor(
    private audioService: WinAudioService,
    private mediaWebsocketService: WinAudioWSService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone// Inyecta NgZone
    // private navigator: Navigator
  ) { }
  ngOnInit(): void {
    this.CurrentSong();

    if(isPlatformBrowser(this.platformId)){
      this.loadProgressFromLocalStorage();

      const hostname = window.location.hostname;
        this.websocketUrl = hostname  === 'localhost' || hostname === '127.0.0.1'
          ? 'wss://localhost:5000' : `wss://${hostname}:5000`;

      // Mueve la conexión y suscripción del WebSocket fuera de la zona de Angular
      this.ngZone.runOutsideAngular(() => {
        this.mediaWebsocketService.connect();

        this.mediaSubscription = this.mediaWebsocketService.mediaInfo$.subscribe(info => {
          // Puedes volver a la zona de Angular si necesitas actualizar la UI
          this.ngZone.run(() => {
            console.log('nno entra1')
            console.log('nno entra1')
            // El 'info' ahora es un array de objetos { serverId, mediaInfo } o { serverId, devices }
            const allServerInfo = info; // Renombrar para mayor claridad
            let relevantMediaInfo: any = null;

            if (allServerInfo && allServerInfo.length > 0) {
              // Si this.serverId no está establecido, tomamos el primero y lo establecemos
              if (!this.serverId) {
                this.serverId = allServerInfo[0].serverId;
              }
              // Buscamos la información de medios para el serverId actual
              const serverData = allServerInfo.find((data: any) => data.serverId === this.serverId);
              if (serverData && serverData.title) {
                relevantMediaInfo = serverData;
              }
            }

            if (relevantMediaInfo && relevantMediaInfo.title) { // Solo procesar si hay información válida
              const isNewSong = this.currentSong.length === 0 || this.currentSong[0].title !== relevantMediaInfo.title;
              const statusChanged = this.currentSong.length === 0 ;
                  console.log('nueva song',isNewSong)
                  this.currentMediaInfo = relevantMediaInfo;
                this.isConnected = true; // Si recibimos info, estamos conectados
                this.currentSong = [relevantMediaInfo];
                this.saveProgressLocalStorage(relevantMediaInfo);
                if(this.currentSong[0].title !== ''){
                  this.mediaElementRef.nativeElement.play();
                }
                if(this.Logs === true){
                  console.log('Información de medios recibida:', relevantMediaInfo);
                  console.log('websocket data: ' ,this.currentSong)
                }
    
                if (isNewSong || statusChanged){
                  this.stopProgressTimer();
                  if(relevantMediaInfo.isPlaying === true){
                    this.startProgressTimer();
                  }
                } else if(relevantMediaInfo.isPlaying === true && !this.progressInterval){
                  this.startProgressTimer();
                } else if(relevantMediaInfo.isPlaying !== true){
                  this.stopProgressTimer();
                }
                if(this.currentSong[0].title !== ''){
                  this.mediaElementRef.nativeElement.play().catch(e => {
                    console.error('Error al reproducir la canción:', e);
                  });
                } else {
                  this.mediaElementRef.nativeElement.pause();
                }
                this.updateMediaSessionMetadata(relevantMediaInfo);

              }else {
                this.stopProgressTimer();
                this.clearLocalStorage();
                this.currentSong = []; // Limpiar currentSong si no hay info relevante
                this.serverId = ''; // Limpiar serverId
                console.log('else pasado,cargando currentSong ', this.currentSong)
            }
            
          });
        });
      });
      this.setupMediaSessionHandlers();
    }
  }
  
  ngOnDestroy(): void {
    if(this.mediaUpdateSubscription){
      this.mediaUpdateSubscription.unsubscribe();
    }
    this.stopProgressTimer();

    this.mediaWebsocketService.disconnect();
  
  }

// Configura los manejadores de eventos para la Media Session API
  private setupMediaSessionHandlers(): void {
    if(isPlatformBrowser(this.platformId)){
      if ('mediaSession' in navigator) {
        console.log('Media Session API está disponible');
        navigator.mediaSession.setActionHandler('play', () => {
          this.ngZone.run(() => this.togglePlayPause());
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          this.ngZone.run(() => this.togglePlayPause());
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          this.ngZone.run(() => this.previousTrack());
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          this.ngZone.run(() => this.nextTrack());
        });
        // Puedes añadir más manejadores si es necesario, como 'seekto', 'seekforward', 'seekbackward'
      }
    }
  }

  // Actualiza la metadata de la Media Session
  private updateMediaSessionMetadata(mediaInfo: MediaInfoData): void {
    if(isPlatformBrowser(this.platformId)){
      if ('mediaSession' in navigator && mediaInfo) {
        console.log('Media Session API Update disponible');
        navigator.mediaSession.metadata = new MediaMetadata({
          title: mediaInfo.title,
          artist: mediaInfo.artist,
          album: mediaInfo.album,
          artwork: [
            { src: '/assets/loli.gif', sizes: '96x96', type: 'image/gif' },
            { src: '/assets/loli.gif', sizes: '128x128', type: 'image/gif' },
            { src: '/assets/loli.gif', sizes: '192x192', type: 'image/gif' },
            { src: '/assets/loli.gif', sizes: '256x256', type: 'image/gif' },
          ]
        });
      }
    }
  }


isPlaying: boolean = false;

  togglePlayPause() {
    // this.isPlaying = !this.isPlaying;
    // console.log(this.isPlaying ? 'Reproduciendo música' : 'Música pausada');

    // if (this.mediaElementRef && this.mediaElementRef.nativeElement) {
    //   if (this.isPlaying) {
    //     this.mediaElementRef.nativeElement.play().catch(e => console.error('Error al reproducir el elemento de audio:', e));
    //   } else {
    //     this.mediaElementRef.nativeElement.pause();
    //   }
    // }

    const commandUse = this.currentMediaInfo?.isPlaying ? 'pause' : 'play';
    console.log('Comando a usar:', commandUse);
    this.audioService.sendCommand(this.serverId, commandUse ,{'payload':'play-pause'} ).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        // this.isPlaying = !this.isPlaying; // Eliminado: el estado se actualiza vía WebSocket
        // this.CurrentSong(); // Actualizar la información de la canción
      
        //  if ('mediaSession' in navigator) {
        //   if (this.isPlaying) {
        //     navigator.mediaSession.playbackState = 'playing';
        //   } else {
        //     navigator.mediaSession.playbackState = 'paused';
        //   }
        // }

      },
      error: (error) => {
        console.error('Error al reproducir/ pausar música:', error);
      }
    });

  }

  previousTrack() {
    console.log('Pista anterior');
    this.audioService.sendCommand(this.serverId, 'prev',{'payload':'anterior'} ).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        // this.CurrentSong(); // Actualizar la información de la canción (ahora vía WebSocket)
      },
      error: (error) => {
        console.error('Error al reproducir/ pausar música:', error);
      }
    });
  }

  nextTrack() {
    console.log('Pista siguiente');
    // Aquí puedes enviar una señal al backend para cambiar a la pista siguiente
    this.audioService.sendCommand(this.serverId, 'next',{'payload':'siguiente'} ).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        // this.CurrentSong(); // Actualizar la información de la canción (ahora vía WebSocket)
      },
      error: (error) => {
        console.error('Error al reproducir/ pausar música:', error);
      }
    });
  }


  CurrentSong() {
    // Eliminado: la información de la canción se obtiene a través del WebSocket
  }

private startProgressTimer(): void {
  this.stopProgressTimer();
  if(this.currentSong.length > 0 && this.currentSong[0].isPlaying){
    this.progressInterval = setInterval(() => {
      if (this.currentSong.length > 0) {
       const song = this.currentSong[0];
       const speed  = song.speed || 1;
        if(song && song.position_seconds !== undefined && song.duration_seconds !== undefined){
          if (song.position_seconds  < song.duration_seconds ){
            song.position_seconds += speed;
            this.saveProgressLocalStorage(song);
           }else {
            this.stopProgressTimer();
           }
        }
      }
    }, 1000);
  }
}

private stopProgressTimer(): void {
  if (this.progressInterval) {
    clearInterval(this.progressInterval);
    this.progressInterval = null;
  }
}

private loadProgressFromLocalStorage(): void {
  if(isPlatformBrowser(this.platformId)){
    const storedMediaInfo = localStorage.getItem('lastMediaInfo');
    if (storedMediaInfo) {
      try {
        const mediaInfo: MediaInfoData = JSON.parse(storedMediaInfo);
        if (mediaInfo && mediaInfo.title) {
          this.currentSong = [mediaInfo];
          this.lastPosition = mediaInfo.position_seconds ?? 0;

          if(mediaInfo.isPlaying === true){
            this.startProgressTimer();
          }
        }
      } catch (error) {
        console.error('Error al parsear el JSON de lastMediaInfo:', error);
        this.clearLocalStorage();
      }
    }
  }
}

private saveProgressLocalStorage(mediaInfo: MediaInfoData): void {
  if(isPlatformBrowser(this.platformId)){
    localStorage.setItem('lastMediaInfo', JSON.stringify(mediaInfo));
  }
}

private clearLocalStorage(): void {
  if(isPlatformBrowser(this.platformId)){
    localStorage.removeItem('lastMediaInfo');
  }
}

  formatTime(seconds: number | undefined): string {
    if (seconds === undefined || isNaN(seconds)) {
      return '0:00';
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }

  seekTo(event: Event): void {
    const target = event.target as HTMLInputElement;
    const seekPosition = parseFloat(target.value);
    // Aquí podrías enviar la nueva posición al backend si tu API lo soporta
    // Por ahora, solo actualizamos la posición localmente para la visualización
    if (this.currentSong.length > 0) {
      this.currentSong[0].position_seconds = seekPosition;
    }
  }

}