import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

import { MetersService } from '../../services/meters.service';
import { MessageService } from '../../../shared/services/message.service';
import { MenuComponent } from "../menu/menu.component";
import { MessageComponent } from '../../../shared/sharedcomponents/message/message.component';
import { MeterData } from '../../models/costandmeterdatas.model';

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
export class MetersComponent implements OnInit {

  users: any[] = [];
  filteredUsers: any[] = [];

  page: number = 1;
  pageSize: number = 10;

  searchTerm: string = '';
  filterEmptyFields: boolean = false; // Új változó a szűréshez

  loadErrorMessage = "Hiba történt az adatok betöltése során. Próbáld meg később!";

  meterData: MeterData = {
    commonCost: undefined,
    amountSmeter: undefined,
    amountFix: undefined,
    subDepSmeter: undefined,
    subDepFix: undefined,
    cold1: '',
    cold2: '',
    hot1: '',
    hot2: '',
    heating: ''
  };

  sortedColumn: string | null = null;

  constructor(public messageService: MessageService, 
    private metersService: MetersService,
  ) { }

  ngOnInit(): void {
    this.getMeters();
    this.getAllResidentsAndMeters();
  }

  onPageSizeChange() {
    this.page = 1;
  }

  filterUsers() {
    const term = this.searchTerm ? this.searchTerm.toLowerCase() : '';

    this.filteredUsers = this.users.filter((user) =>
      (user.username.toLowerCase().includes(term) ||
      (user.typeOfBuildings && user.typeOfBuildings.toLowerCase().includes(term))) &&
      (!this.filterEmptyFields || // Csak akkor alkalmazzuk a szűrőt, ha a filterEmptyFields igaz
        user.cold1 === undefined || user.cold2 === undefined || user.hot1 === undefined || user.hot2 === undefined || user.heating === undefined)
    );

    if (this.sortedColumn) {
      this.sortUsers(this.sortedColumn);
    }
  }

  getAllResidentsAndMeters() {
    const monthAndYear = this.getCurrentMonthAndYear();

    this.metersService.getMetersValues(monthAndYear).subscribe(
      response => {
        if (response.status === 'success') {
          this.users = response.data;
          console.log("meters", this.users);

          this.filterUsers(); 
          this.sortUsers('username');
        } else {
          this.messageService.setErrorMessage(this.loadErrorMessage);
        }
      },
      error => {
        this.messageService.setErrorMessage(this.loadErrorMessage);
      }
    );
  }

  getMeters() { 
    this.metersService.getMeters().subscribe(
      data => {
        this.meterData.cold1 = data.cold1;
        this.meterData.cold2 = data.cold2;
        this.meterData.hot1 = data.hot1;
        this.meterData.hot2 = data.hot2;
        this.meterData.heating = data.heating;
      },
      error => {
        this.messageService.setErrorMessage(this.loadErrorMessage);
      }
    );
  }

  sortUsers(key: string) {
    if (this.filteredUsers.length > 1) {
      this.filteredUsers.sort((a, b) => {
        const valueA = this.getSortableValue(a[key]);
        const valueB = this.getSortableValue(b[key]);

        if (valueA < valueB) {
          return -1;
        }
        if (valueA > valueB) {
          return 1;
        }

        if (key === 'typeOfBuildings') {
          const floorA = this.getSortableValue(a['typeOfFloors']);
          const floorB = this.getSortableValue(b['typeOfFloors']);

          if (floorA < floorB) {
            return -1;
          }
          if (floorA > floorB) {
            return 1;
          }

          if (floorA === floorB) {
            const doorA = this.getSortableValue(a['typeOfDoors']);
            const doorB = this.getSortableValue(b['typeOfDoors']);

            if (doorA < doorB) {
              return -1;
            }
            if (doorA > doorB) {
              return 1;
            }
          }
        }

        return 0;
      });

      this.sortedColumn = key; 
    }
  }

  getSortableValue(value: any): any {
    if (!isNaN(value)) { 
      return parseFloat(value); 
    }
    return value && value.toUpperCase ? value.toUpperCase() : ''; 
  }

  getCurrentMonthAndYear(): string {
    const currentDate = new Date();
    const month = ('0' + (currentDate.getMonth() + 1)).slice(-2); // Hónap (01-12)
    const year = currentDate.getFullYear(); // Év (YYYY)

    return `${month}-${year}`;
  }

  justEmptyFields() {
    this.filterEmptyFields = !this.filterEmptyFields; // Változtatja a filterEmptyFields értékét
    this.filterUsers();
  }

  saveMetersById(userId: number) {
    console.log('saveMetersById', userId);
  }
}
