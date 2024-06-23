import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../../../shared/services/message.service';

@Component({
  selector: 'app-costs',
  standalone: true,
  imports: [],
  templateUrl: './costs.component.html',
  styleUrl: './costs.component.css'
})
export class CostsComponent {

  constructor(public messageService: MessageService) { }
}
