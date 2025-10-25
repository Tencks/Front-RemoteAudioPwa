export interface AudioSession {
    id: string;
    name: string;
    volume: number;
    mute: boolean;
    deviceID: number;
  }
  
  export interface DevicesResponse {
    message: string;
    devices: AudioDevice[];
  }

  export interface AudioDevice {
    id: number;
    name: string;
    type: number;
    volume: number;
    mute: boolean;
    sessions: AudioSession[];
  }

  export interface DeviceFilter {
  id: string;
  name: string;
  type: number;
  enabled: boolean;
}

export interface MediaInfo {
 
    title?: string;
    artist?: string;
    album?: string;
    duration_seconds?: number;
    position_seconds?: number;
    speed:1;
    isPlaying?: boolean;
  
}