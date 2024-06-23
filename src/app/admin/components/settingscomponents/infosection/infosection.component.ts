import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-infosection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './infosection.component.html',
  styleUrl: './infosection.component.css'
})
export class InfosectionComponent {

  @Input() title: string = '';
  showInfo: boolean = false;

  toggleInfo() {
    this.showInfo = !this.showInfo;
  }
}
