import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

import { MenuComponent } from "../menu/menu.component";
import { MessageComponent } from '../../../shared/sharedcomponents/message/message.component';

@Component({
  selector: 'app-meters',
  standalone: true,
  imports: [MenuComponent, 
    NgbPaginationModule, 
    MessageComponent,
    FormsModule,
    CommonModule],
  templateUrl: './meters.component.html',
  styleUrls: ['../../../shared/css/userlist.css']
})
export class MetersComponent {

  users: any[] = [];
  filteredUsers: any[] = [];

  page: number = 1;
  pageSize: number = 10;

  searchTerm: string = '';

  
  loadErrorMessage = "Hiba történt az adatok betöltése során. Próbáld meg később!";

  commonCost: string | undefined;
  amountSmeter: number | undefined;
  amountFix: number | undefined;
  subDepSmeter: number | undefined;
  subDepFix: number | undefined;

  cold1: string = '';
  cold2: string = '';
  hot1: string = '';
  hot2: string = '';
  heating: string = '';

  sortedColumn: string | null = null;



  onPageSizeChange() {
    this.page = 1;
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      return user.name.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
  }
}
