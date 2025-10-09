import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DevicesComponent } from './components/devices/devices.component';
import { ConfigComponent } from './components/config/config.component';
import { DevicesInComponent } from './components/devices/devices-in/devices-in.component';

export const routes: Routes = [
    {
        path: '',
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
        path: '**',
        component: HomeComponent,
        redirectTo: ''
    },
];
