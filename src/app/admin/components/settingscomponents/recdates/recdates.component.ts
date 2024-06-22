import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recdates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recdates.component.html',
  styleUrl: './recdates.component.css'
})
export class RecdatesComponent {

  days: number[] = [];
  startDay: number | null = 1;
  endDay: number | null = null;

  message: string = '';

  constructor() { 
    this.generateDays();
  }

  private generateDays() {
    for (let i = 1; i <= 31; i++) {
      this.days.push(i);
    }
  }
  updateEndDayOptions() {
    if (this.endDay !== null && this.startDay !== null && this.endDay <= this.startDay) {
      this.endDay = null;
    }
  }

  isEndDaySelectable(day: number): boolean {
    return this.startDay === null || day > this.startDay - 1;
  }

  isValid(): boolean {
    return this.startDay !== null && this.endDay !== null;
  }

  saveDates() {
    if (this.isValid()) {
      console.log('Kezdő nap:', this.startDay, 'Befejező nap:', this.endDay);
      if (this.startDay && this.endDay && this.startDay <= this.endDay) {
            this.showMessage('A dátumok sikeresen mentve.');
            return;
            // TODO: save dates
    }
  }

}

  private showMessage(message: string) {
    this.message = message;
    setTimeout(() => {
      this.message = "";
    }, 3000);
  }

}
