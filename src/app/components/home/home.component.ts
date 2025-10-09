import { Component } from '@angular/core';

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
export class HomeComponent  {
  showUwu: boolean = false; // Estado para mostrar u ocultar "UwU"
  private hideTimeout: any; // Variable para manejar el timeout

isPlaying: boolean = false;

  togglePlayPause() {
    this.isPlaying = !this.isPlaying;
    console.log(this.isPlaying ? 'Reproduciendo música' : 'Música pausada');
    // Aquí puedes enviar una señal al backend para ejecutar la acción en Windows
  }

  previousTrack() {
    console.log('Pista anterior');
    // Aquí puedes enviar una señal al backend para cambiar a la pista anterior
  }

  nextTrack() {
    console.log('Pista siguiente');
    // Aquí puedes enviar una señal al backend para cambiar a la pista siguiente
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