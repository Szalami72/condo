import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecdatesService } from '../../../services/recdates.service';
import { MessageService } from '../../../../shared/services/message.service';


@Component({
  selector: 'app-recdates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recdates.component.html',
  styleUrl: './recdates.component.css'
})
export class RecdatesComponent implements OnInit {

  days: number[] = [];
  startDay: number | null = null;
  endDay: number | null = null;


  constructor(private recdatesService: RecdatesService, public messageService: MessageService) {
    this.generateDays();
  }

  ngOnInit() {
    this.recdatesService.getRecordDates().subscribe(
      data => {
        this.startDay = data.startDay;
        this.endDay = data.endDay;
      },
      error => {
        this.messageService.setErrorMessage('Hiba történt az adatok letöltése során. Próbáld meg később!');
      }
    );
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
      if (this.startDay && this.endDay && this.startDay <= this.endDay) {
        this.recdatesService.saveRecordDates(this.startDay, this.endDay).subscribe({
          next: (response) => {
            this.messageService.setMessage('A dátumok sikeresen mentve.');
          },
          error: (error) => {
            this.messageService.setErrorMessage('Hiba történt a mentés során. Próbáld meg később!');
          }
        });
      }
    }
  }



  // private showMessage(message: string) {
  //   this.errorMessage = "";
  //   this.message = message;
  //   setTimeout(() => {
  //     this.message = "";
  //   }, 3000);
  // }

  // private showErrorMessage(errorMessage: string) {
  //   this.errorMessage = errorMessage;
  //   setTimeout(() => {
  //     this.errorMessage = "";
  //   }, 3000);
  // }

}
