import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { MenuComponent } from '../menu/menu.component';
import { MessageService } from '../../../shared/services/message.service';
import { CostsService } from '../../services/costs.service';
import { MetersService } from '../../services/meters.service';
import { AddresidentComponent } from '../residentcomponents/addresident/addresident.component';
import { from } from 'rxjs';

@Component({
  selector: 'app-residents',
  standalone: true,
  imports: [MenuComponent, CommonModule, FormsModule, NgbPaginationModule, NgbModule, AddresidentComponent],
  templateUrl: './residents.component.html',
  styleUrl: './residents.component.css'
})
export class ResidentsComponent implements OnInit {

  users: any[] = [];
  filteredUsers: any[] = [];

  page: number = 1;
  pageSize: number = 10;

  searchTerm: string = '';


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


  constructor(public messageService: MessageService, 
    private costsService: CostsService,
    private metersService: MetersService,
    private modalService: NgbModal
    ) {}

  ngOnInit(): void {
    this.loadCosts();
    this.getMeters();
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
        this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
      }
    } catch (error) {
      this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
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
        this.messageService.setErrorMessage('Hiba történt az adatok letöltése során. Próbáld meg később!');
      }
    );
  }

  onPageSizeChange() {
    this.page = 1;
  }

  filterUsers() {
    this.filteredUsers = this.users.filter((user) =>
      user.personalData.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  addNewResident() {
    const modalRef = this.modalService.open(AddresidentComponent, { size: 'lg' });
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

  }
  

}
