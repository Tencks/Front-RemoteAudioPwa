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
