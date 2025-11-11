import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WinAudioWSService {
  private webSocket!: WebSocket;
  private mediaInfoSubject = new BehaviorSubject<any[]>([]); // Para almacenar la información de medios de todos los servidores
  private devicesSubject = new BehaviorSubject<any[]>([]); // Para almacenar la información de dispositivos de todos los servidores
  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  public mediaInfo$ = this.mediaInfoSubject.asObservable();
  private Logs: boolean = true;
  public devices$ = this.devicesSubject.asObservable();
  public isConnected$ = this.isConnectedSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  public connect(): void {
    if (isPlatformBrowser(this.platformId)) {
      const hostname = window.location.hostname;
      const wsUrl = `wss://${hostname}:5000`; // Conectar al Backend Central

      this.webSocket = new WebSocket(wsUrl);

      this.webSocket.onopen = () => {
        console.log('Conexión WebSocket establecida con el Backend Central');
        this.isConnectedSubject.next(true);
      };

    // this.webSocket.onmessage = (event) => {
    //   try {
    //     const data = JSON.parse(event.data);
    //     this.mediaInfoSubject.next(data);
    //     if(this.Logs === true){
    //       console.log('Websocket Message', data);
    //     }
    //   } catch (error) {
    //     console.error('Error al parsear el websocket', error)
    //   }
    // };
    this.webSocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('Mensaje WebSocket recibido:', message);

        if (message.type === 'initial_state' || message.type === 'update') {
          const allServerInfo = message.data;
          const allMedia: any[] = [];
          const allDevices: any[] = [];

          allServerInfo.forEach((info: any) => {
            if (info.mediaInfo) {
              allMedia.push({ serverId: info.serverId, ...info.mediaInfo });
            }
            if (info.devices) {
              allDevices.push({ serverId: info.serverId, devices: info.devices });
            }
          });
          
          this.mediaInfoSubject.next(allMedia);
          this.devicesSubject.next(allDevices);
        }
      };

      this.webSocket.onclose = () => {
        console.log('Conexión WebSocket cerrada');
        this.isConnectedSubject.next(false);
        // Intentar reconectar después de un tiempo
        setTimeout(() => this.connect(), 3000);
      };
  

   

    this.webSocket.onerror = (event) => {
      console.error('Websocket Error', event);
    };

  }
}

  public disconnect():void {
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.close();
    }
  }

}
