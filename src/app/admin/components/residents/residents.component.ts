import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MenuComponent } from '../menu/menu.component';
import { MessageService } from '../../../shared/services/message.service';
import { from } from 'rxjs';

@Component({
  selector: 'app-residents',
  standalone: true,
  imports: [MenuComponent, CommonModule, FormsModule],
  templateUrl: './residents.component.html',
  styleUrl: './residents.component.css'
})
export class ResidentsComponent {

  users: any[] = [];
  filteredUsers: any[] = [];

  page: number = 1;
  pageSize: number = 10;

  constructor(public messageService: MessageService) {}
}
