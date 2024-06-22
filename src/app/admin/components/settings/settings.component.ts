import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../../components/menu/menu.component';
import { FormsModule } from '@angular/forms';
import { RecdatesComponent } from '../settingscomponents/recdates/recdates.component';
import { MetersComponent } from '../settingscomponents/meters/meters.component';
import { MessageService } from '../../../shared/services/message.service';

@Component({
    selector: 'app-settings',
    standalone: true,
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.css',
    imports: [MenuComponent,
            CommonModule,
            FormsModule,
            RecdatesComponent,
            MetersComponent]
})
export class SettingsComponent {

  constructor(public messageService: MessageService) { }
  
}
