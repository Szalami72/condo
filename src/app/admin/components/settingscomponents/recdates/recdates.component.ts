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
  endDay: number | null = 2;


  message: string = '';
  errorMessage: string = '';

  constructor() { 
    this.generateDays();
  }

  private generateDays() {
    for (let i = 1; i <= 31; i++) {
      this.days.push(i);
    }
  }

  saveDates(): void {
 
    console.log(this.startDay, this.endDay);
    if ((!this.startDay || !this.endDay) || (this.startDay > this.endDay)) {
      this.message = '';
      this.errorMessage = 'A kezdő dátum nem lehet nagyobb, mint a befejezés dátum!';
      return;
    }
    

    if (this.startDay && this.endDay && this.startDay <= this.endDay) {
      this.errorMessage = '';
      this.message = 'A dátumok sikeresen mentve.';
      return;
      // TODO: save dates
    }
  }

}
