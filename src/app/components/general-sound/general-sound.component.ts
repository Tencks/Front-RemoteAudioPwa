import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID, NgZone, viewChild, ViewChild, ElementRef } from '@angular/core';
import { WinAudioService } from '../../services/server/win-audio.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MediaInfo } from '../../core/interfaces/AudioInterface';
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
  currentSong: MediaInfo[] = [];
  private mediaUpdateSubscription: Subscription | undefined;
  progressInterval: any; // Para almacenar el ID del intervalo de progreso

  currentMediaInfo: any | null = null;
  isConnected: boolean = false;
  private mediaSubscription!: Subscription;
  websocketUrl:string = '';
  private Logs: boolean = false;

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
      const hostname = window.location.hostname;
        this.websocketUrl = hostname  === 'localhost' || hostname === '127.0.0.1'
          ? 'wss://localhost:5000' : `wss://${hostname}:5000`;

      // Mueve la conexión y suscripción del WebSocket fuera de la zona de Angular
      this.ngZone.runOutsideAngular(() => {
        this.mediaWebsocketService.connect(this.websocketUrl);

        this.mediaSubscription = this.mediaWebsocketService.mediaInfo$.subscribe(info => {
          // Puedes volver a la zona de Angular si necesitas actualizar la UI
          this.ngZone.run(() => {
            this.currentMediaInfo = info;
            this.isConnected = true; // Si recibimos info, estamos conectados
            this.currentSong = [info];
            if(this.Logs === true){
              console.log('Información de medios recibida:', info);
              console.log('websocket data: ' ,this.currentSong)
            }
            this.updateMediaSessionMetadata(info);
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
    if(this.progressInterval){
      clearInterval(this.progressInterval);
    }

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
  private updateMediaSessionMetadata(mediaInfo: MediaInfo): void {
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
    this.isPlaying = !this.isPlaying;
    console.log(this.isPlaying ? 'Reproduciendo música' : 'Música pausada');

    if (this.mediaElementRef && this.mediaElementRef.nativeElement) {
      if (this.isPlaying) {
        this.mediaElementRef.nativeElement.play().catch(e => console.error('Error al reproducir el elemento de audio:', e));
      } else {
        this.mediaElementRef.nativeElement.pause();
      }
    }

    this.audioService.MusicPlayPause().subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.CurrentSong(); // Actualizar la información de la canción después de play/pause

        if ('mediaSession' in navigator) {
          if (this.isPlaying) {
            navigator.mediaSession.playbackState = 'playing';
          } else {
            navigator.mediaSession.playbackState = 'paused';
          }
        }

      },
      error: (error) => {
        console.error('Error al reproducir/ pausar música:', error);
      }
    });
    // Aquí puedes enviar una señal al backend para ejecutar la acción en Windows
  }

  previousTrack() {
    console.log('Pista anterior');
    // Aquí puedes enviar una señal al backend para cambiar a la pista anterior
    this.audioService.MusicPrevious().subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.CurrentSong(); // Actualizar la información de la canción
      },
      error: (error) => {
        console.error('Error al reproducir/ pausar música:', error);
      }
    });
  }

  nextTrack() {
    console.log('Pista siguiente');
    // Aquí puedes enviar una señal al backend para cambiar a la pista siguiente
    this.audioService.MusicNext().subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.CurrentSong(); // Actualizar la información de la canción
      },
      error: (error) => {
        console.error('Error al reproducir/ pausar música:', error);
      }
    });
  }

   // Función para ocultar "UwU" después de un tiempo
  hideUwuSoon(): void {
    // Limpiar cualquier timeout previo
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }

    // Configurar un timeout para ocultar "UwU" después de 1 segundo
    this.hideTimeout = setTimeout(() => {
      this.showUwu = false;
    }, 2000); // 1000 ms = 1 segundo
  }

  CurrentSong() {
    // this.audioService.MusicCurrent().subscribe({
    //   next: (response: any) => {
    //     // console.log('Respuesta de MusicCurrent:', response);
    //     this.currentSong = [response.mediaInfo];  // Mantengo tu lógica original
    //     const newMediaInfo = [response.mediaInfo];  // Mantengo tu lógica original
    //     if (this.currentSong.length || this.currentSong[0].title !== newMediaInfo[0].title) {  // Mantengo tu lógica original
    //       this.currentSong = newMediaInfo;  // Mantengo tu lógica original

    //     }
    //   },
    //   error: (error) => {
    //     console.error('Error al obtener la canción actual:', error);
    //     // En caso de error, limpiamos el intervalo para evitar fugas
    //     clearInterval(this.progressInterval);
    //     this.progressInterval = null;
    //   }
    // });
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