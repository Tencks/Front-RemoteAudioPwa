import { Component, OnDestroy, OnInit } from '@angular/core';
import { WinAudioService } from '../../services/server/win-audio.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MediaInfo } from '../../core/interfaces/AudioInterface';
import { interval, Subscription } from 'rxjs';

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
  showUwu: boolean = false; // Estado para mostrar u ocultar "UwU"
  private hideTimeout: any; // Variable para manejar el timeout
  currentSong: MediaInfo[] = [];
  private mediaUpdateSubscription: Subscription | undefined;

  constructor(private audioService: WinAudioService) { }
  ngOnInit(): void {
    this.CurrentSong();
    // this.mediaUpdateSubscription = interval(1000).subscribe(() => {
    //   this.CurrentSong();
    // });
  }

  ngOnDestroy(): void {
    if(this.mediaUpdateSubscription){
      this.mediaUpdateSubscription.unsubscribe();
    }
  }


isPlaying: boolean = false;

  togglePlayPause() {
    this.isPlaying = !this.isPlaying;
    console.log(this.isPlaying ? 'Reproduciendo música' : 'Música pausada');
    this.audioService.MusicPlayPause().subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.CurrentSong(); // Actualizar la información de la canción después de play/pause
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
    this.audioService.MusicCurrent().subscribe({
      next: (response: any) => {
        // console.log('Respuesta de MusicCurrent:', response);
        this.currentSong = [response.mediaInfo];
        // console.log('CurrentSong[0].mInfo:', this.currentSong[0]);
        this.isPlaying = response.isPlaying === 'playing';
      },
      error: (error) => {
        console.error('Error al obtener la canción actual:', error);
      }
    });
  }

  // formatTime(seconds: number | undefined): string {
  //   if (seconds === undefined || isNaN(seconds)) {
  //     return '0:00';
  //   }
  //   const minutes = Math.floor(seconds / 60);
  //   const remainingSeconds = Math.floor(seconds % 60);
  //   return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  // }

  // seekTo(event: Event): void {
  //   const target = event.target as HTMLInputElement;
  //   const seekPosition = parseFloat(target.value);
  //   // Aquí podrías enviar la nueva posición al backend si tu API lo soporta
  //   // Por ahora, solo actualizamos la posición localmente para la visualización
  //   if (this.currentSong.length > 0) {
  //     this.currentSong[0].position = seekPosition;
  //   }
  // }

}