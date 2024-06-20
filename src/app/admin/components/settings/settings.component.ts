import { Component } from '@angular/core';
import  { MenuComponent } from '../../components/menu/menu.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [MenuComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {

}
