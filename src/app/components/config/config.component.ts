import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AudioDevice, DeviceFilter } from '../../core/interfaces/AudioInterface';
import { WinAudioService } from '../../services/server/win-audio.service';

@Component({
  selector: 'app-config',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './config.component.html',
  styleUrl: './config.component.css'
})
export class ConfigComponent implements OnInit{
  devices: DeviceFilter[] = [];
  filteredDevices: DeviceFilter[] = [];
  searchTerm: string = '';
  filterType: number = 0;

  private readonly STORAGE_KEY = 'audioDeviceFilters';
  private isBrowser: boolean = false;

    constructor(
    private audioService: WinAudioService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  
  ngOnInit(): void {
      this.loadDevices();
  }

  loadDevices(){
    this.audioService.getDevices().subscribe({
      next: (audioDevices:AudioDevice[]) => {
        //convertimo de AudioDevice a DeviceFilter
        const deviceFilters: DeviceFilter[] = audioDevices.map(device =>({
          id: device.id.toString(),
          name: device.name,
          type: device.type,
          enabled: true, //Por defecto traemos todos
        }));
        //Cargamos datos del LocalStorage(solo si estamos en el navegador)
        if (this.isBrowser) {
          const savedFilters = this.loadFromLocalStorage();
          if(savedFilters.length > 0){
            deviceFilters.forEach(device =>{
              const saved = savedFilters.find(d => d.id === device.id);
              if(saved){
                device.enabled = saved.enabled;
              }
            })
          }
        this.devices = deviceFilters;
        this.filteredDevices = deviceFilters;
        if (this.isBrowser) {
          this.saveToLocalStorage();
        }}
      },
      error: (err) => {
        console.error('Error al cargar dispositivos: ', err);
        // Cargar desde localStorage como fallback (solo si estamos en el navegador)
        if (this.isBrowser) {
          this.devices = this.loadFromLocalStorage();
          this.filteredDevices = this.devices;
        } 
    }})    
  }
  
private loadFromLocalStorage(): DeviceFilter[] {
    if (!this.isBrowser) {
        return [];
      }
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error al cargar filtros de localStorage:', error);
      return [];
    }
  }

private saveToLocalStorage() {
    if (!this.isBrowser) {
      return;
    }
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.devices));
    } catch (error) {
      console.error('Error al guardar filtros en localStorage:', error);
    }
  }

  toggleDevice(deviceId: string) {
    const device = this.devices.find(d => d.id === deviceId);
    if (device) {
      device.enabled = !device.enabled;
      if (this.isBrowser) {
        this.saveToLocalStorage();
      }
      this.filterDevices();
    }
  }

  filterDevices() {
    this.filteredDevices = this.devices.filter(device => {
      const matchesSearch = device.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesType =  device.type === this.filterType || this.filterType === -1 && device.enabled;
      return matchesSearch && matchesType;
    });
  }

  resetFilters() {
    this.devices.forEach(device => device.enabled = true);
    if (this.isBrowser) {
      this.saveToLocalStorage();
    }
    this.filterDevices();
  }

  get enabledDevicesCount(): number {
    return this.devices.filter(d => d.enabled).length;
  }

  get totalDevicesCount(): number {
    return this.devices.length;
  }
}