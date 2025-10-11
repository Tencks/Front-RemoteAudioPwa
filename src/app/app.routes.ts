import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DevicesComponent } from './components/devices/devices.component';
import { ConfigComponent } from './components/config/config.component';
import { DevicesInComponent } from './components/devices/devices-in/devices-in.component';
import { GeneralSoundComponent } from './components/general-sound/general-sound.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo:'home',
        pathMatch:'full'
    },
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'devicesOut',
        component: DevicesComponent
    },
    {
        path: 'devicesIn',
        component: DevicesInComponent
    },
    {
        path:'config',
        component: ConfigComponent
    },
    {
        path:'music',
        component: GeneralSoundComponent
    },
    {
        path: '**',
        component: HomeComponent,
        redirectTo: ''
    },
];
