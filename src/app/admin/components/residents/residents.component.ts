import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { MenuComponent } from '../menu/menu.component';
import { MessageService } from '../../../shared/services/message.service';
import { MessageComponent } from '../../../shared/sharedcomponents/message/message.component';
import { CostsService } from '../../services/costs.service';
import { MetersService } from '../../services/meters.service';
import { ResidentsService } from '../../services/residents.service';
import { AddAndEditResidentComponent } from '../residentcomponents/addAndEditResident/addAndEditResident.component';
@Component({
  selector: 'app-residents',
  standalone: true,
  imports: [MenuComponent,
            CommonModule, 
            FormsModule, 
            NgbPaginationModule, 
            NgbModule, 
            AddAndEditResidentComponent,
            MessageComponent],
  templateUrl: './residents.component.html',
  styleUrl: './residents.component.css'
})
export class ResidentsComponent implements OnInit {

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
  

  constructor(public messageService: MessageService, 
    private costsService: CostsService,
    private metersService: MetersService,
    private modalService: NgbModal,
    private residentsService: ResidentsService
    ) {}

  ngOnInit(): void {
    this.loadCosts();
    this.getMeters();
    this.getAllResidents();
    
  }

  getAllResidents() {
    this.residentsService.getAllResidents().subscribe(
      response => {
        if (response.status === 'success') {
          this.users = response.data;
       
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

  async loadCosts() {
    try {
      const response = await this.costsService.getCosts().toPromise();
      if (response.status === 'success') {
        const data = response.data;

        this.commonCost = data.commonCost || undefined;
        this.amountSmeter = data.amountSmeter ? Number(data.amountSmeter) : undefined;
        this.amountFix = data.amountFix ? Number(data.amountFix) : undefined;
        this.subDepSmeter = data.subDepSmeter ? Number(data.subDepSmeter) : undefined;
        this.subDepFix = data.subDepFix ? Number(data.subDepFix) : undefined;

      } else {
        this.messageService.setErrorMessage(this.loadErrorMessage);
      }
    } catch (error) {
      this.messageService.setErrorMessage(this.loadErrorMessage);
    }
  }

  getMeters() { 
    this.metersService.getMeters().subscribe(
      data => {
        this.cold1 = data.cold1;
        this.cold2 = data.cold2;
        this.hot1 = data.hot1;
        this.hot2 = data.hot2;
        this.heating = data.heating;
      },
      error => {
        this.messageService.setErrorMessage(this.loadErrorMessage);
      }
    );
  }

  onPageSizeChange() {
    this.page = 1;
  }

  filterUsers() {
    const term = this.searchTerm ? this.searchTerm.toLowerCase() : '';
  
    this.filteredUsers = this.users.filter((user) =>
      user.username.toLowerCase().includes(term) ||
      (user.typeOfBuildings && user.typeOfBuildings.toLowerCase().includes(term))
    );

    if (this.sortedColumn) {
      this.sortUsers(this.sortedColumn);
    }
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
  
  addAndEditResident(userId: number | undefined) {
    const modalRef = this.modalService.open(AddAndEditResidentComponent, { size: 'lg' });
    modalRef.componentInstance.commonCost = this.commonCost;
    modalRef.componentInstance.amountSmeter = this.amountSmeter;
    modalRef.componentInstance.amountFix = this.amountFix;
    modalRef.componentInstance.subDepSmeter = this.subDepSmeter;
    modalRef.componentInstance.subDepFix = this.subDepFix;
    modalRef.componentInstance.cold1 = this.cold1;
    modalRef.componentInstance.cold2 = this.cold2;
    modalRef.componentInstance.hot1 = this.hot1;
    modalRef.componentInstance.hot2 = this.hot2;
    modalRef.componentInstance.heating = this.heating;
    modalRef.componentInstance.userId = userId;

    modalRef.result.then(
      (result) => {
        this.getAllResidents();
      }
    );

  }
  
  editResident(id: number) {
    this.addAndEditResident(id);
    console.log('goToResident', id);
  }

}
