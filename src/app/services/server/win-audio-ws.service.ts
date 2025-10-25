import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WinAudioWSService {
  private socket!: WebSocket;
  private mediaInfoSubject = new Subject<any>();
  public mediaInfo$ = this.mediaInfoSubject.asObservable();
  private Logs: boolean = true;

  constructor() { }

  public connect(url: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('Websocket Connect');
      return;
    }

    this.socket = new WebSocket(url);
    
    this.socket.onopen = (event) => {

        console.log('Websocket Open', event);
      
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.mediaInfoSubject.next(data);
        if(this.Logs === true){
          console.log('Websocket Message', data);
        }
      } catch (error) {
        console.error('Error al parsear el websocket', error)
      }
    };

    this.socket.onclose = (event) => {
      console.log('Websocket Close', event);
      // Opcional: intentar reconectar después de un tiempo
      // setTimeout(() => this.connect(url), 3000);
    };

    this.socket.onerror = (event) => {
      console.error('Websocket Error', event);
    };

  }

  public disconnect():void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
  }

}
