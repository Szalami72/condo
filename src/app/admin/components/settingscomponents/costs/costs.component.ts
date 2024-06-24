import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../../../shared/services/message.service';

@Component({
  selector: 'app-costs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './costs.component.html',
  styleUrl: './costs.component.css'
})
export class CostsComponent {

  commonCost: string | undefined;

  constructor(public messageService: MessageService) { 
    
  }
}
