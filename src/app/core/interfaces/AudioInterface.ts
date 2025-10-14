export interface AudioSession {
    id: string;
    name: string;
    volume: number;
    mute: boolean;
    deviceID: number;
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
 
    title: string;
    artist: string;
    album: string;
    duration: number;
    position: number;
    isPlaying: boolean;
  
}