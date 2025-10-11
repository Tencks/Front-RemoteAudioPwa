import { Component, OnInit } from '@angular/core';
import { WinAudioService } from '../../services/server/win-audio.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-general-sound',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './general-sound.component.html',
  styleUrl: './general-sound.component.css'
})
export class GeneralSoundComponent implements OnInit {
  showUwu: boolean = false; // Estado para mostrar u ocultar "UwU"
  private hideTimeout: any; // Variable para manejar el timeout

  constructor(private audioService: WinAudioService) { }

  ngOnInit(): void {
    
  }

isPlaying: boolean = false;

  togglePlayPause() {
    this.isPlaying = !this.isPlaying;
    console.log(this.isPlaying ? 'Reproduciendo música' : 'Música pausada');
    this.audioService.MusicPlayPause().subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
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
}