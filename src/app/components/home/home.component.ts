import { Component  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeneralSoundComponent } from '../general-sound/general-sound.component';
import { DevicesComponent } from '../devices/devices.component';



@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    FormsModule,
    GeneralSoundComponent,
    DevicesComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent  {

}