import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../../../shared/services/message.service';
import { MetersService } from '../../../services/meters.service';

@Component({
  selector: 'app-meters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meters.component.html',
  styleUrls: ['./meters.component.css']
})
export class MetersComponent implements OnInit {

  cold1 = false;
  cold2 = false;
  hot1 = false;
  hot2 = false;
  heating = false;
  severally = false;
  coldAmount: number = 0;
  hotAmount: number = 0;
  heatingAmount: number = 0;

  constructor(private metersService: MetersService, public messageService: MessageService) { }

  ngOnInit(): void {
    this.getMeters();
  }

  saveMeters(): void {
    const metersData = {
      cold1: this.cold1 || false,
      cold2: this.cold2 || false,
      hot1: this.hot1 || false,
      hot2: this.hot2 || false,
      heating: this.heating || false,
      severally: this.severally || false,
      coldAmount: this.coldAmount || 0,
      hotAmount: this.hotAmount || 0,
      heatingAmount: this.heatingAmount || 0
  
    };

    this.metersService.saveMeters(metersData).subscribe({
      next: (response) => {
        this.messageService.setMessage('Az adatok mentése sikeres.');
      },
      error: (error) => {
        this.messageService.setErrorMessage('Hiba történt a mentés során. Próbáld meg később!');
      }
    });
  }

  getMeters() { 
    this.metersService.getMeters().subscribe(
      data => {
        this.cold1 = data.cold1;
        this.cold2 = data.cold2;
        this.hot1 = data.hot1;
        this.hot2 = data.hot2;
        this.heating = data.heating;
        this.severally = data.severally;
        this.coldAmount = data.coldAmount;
        this.hotAmount = data.hotAmount;
        this.heatingAmount = data.heatingAmount;
      },
      error => {
        this.messageService.setErrorMessage('Hiba történt az adatok letöltése során. Próbáld meg később!');
      }
      
    );
  }

 uncheckSeverally() {
    this.severally = false;
    
  }

  uncheckMeters() {
    this.cold1 = false;
    this.cold2 = false;
    this.hot1 = false;
    this.hot2 = false;
    this.heating = false;
  }
}
