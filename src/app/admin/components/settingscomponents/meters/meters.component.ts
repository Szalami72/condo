import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../../../shared/services/message.service';
import { MetersService } from '../../../services/meters.service';

@Component({
  selector: 'app-meters',
  standalone: true,
  imports: [CommonModule,
            FormsModule,
          ],
  templateUrl: './meters.component.html',
  styleUrl: './meters.component.css'
})
export class MetersComponent implements OnInit {

  cold1 = false;
  cold2 = false;
  hot1 = false;
  hot2 = false;
  heating = false;

  constructor(public messageService: MessageService) { }

  ngOnInit(): void {
  }

  saveMeters() {  

  }

  isValid(): boolean {
    return this.cold1 || this.cold2 || this.hot1 || this.hot2 || this.heating;
  }
}
