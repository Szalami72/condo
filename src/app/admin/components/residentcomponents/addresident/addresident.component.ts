import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { MessageService } from '../../../../shared/services/message.service';
import { ResidentsService } from '../../../services/residents.service';


@Component({
  selector: 'app-addresident',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  providers: [],
  templateUrl: './addresident.component.html',
  styleUrl: './addresident.component.css'
})
export class AddresidentComponent implements OnInit {

  @Input() commonCost: string | undefined;
  @Input() amountSmeter: number | undefined;
  @Input() amountFix: number | undefined;
  @Input() subDepSmeter: number | undefined;
  @Input() subDepFix: number | undefined;
  
  form: FormGroup | undefined;

  errorMessage: string | undefined;

  name: string | undefined;
  email: string | undefined;
  phone: string | undefined;

  building: string | undefined;
  buildingOptions : any[] = [];
  newBuilding: string | undefined;

  floor: string | undefined;
  floorOptions : any[] = [];
  newFloor: string | undefined;

  door: string | undefined;
  doorOptions : any[] = [];
  newDoor: string | undefined;

  commoncostBase: string | undefined;
  commoncostOptions : any[] = [];
  newCommoncost: string | undefined;

  squareMeter: string | undefined;
  squareMeterOptions : any[] = [];
  newSquareMeter: string | undefined;

  balance: number = 0;

  adminLevel: number = 2;

  isMeter: number = 1;


  constructor(private activeModal: NgbActiveModal,
    private residentsService: ResidentsService,
    public messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadBuildings();
    this.loadFloors();
    this.loadDoors();
    this.loadCommonCosts();
    this.loadSquareMeters();
    
   }

   setForm() {
    this.form = new FormGroup({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl(''),
      building: new FormControl(''),
      newBuilding: new FormControl(''),
      floor: new FormControl(''),
      newFloor: new FormControl(''),
      door: new FormControl(''),
      newDoor: new FormControl(''),
      squareMeter: new FormControl(''),
      newSquareMeter: new FormControl(''),
      commoncostBase: new FormControl(''),
      newCommoncost: new FormControl(''),
      balance: new FormControl(''),
      isMeter: new FormControl(''),
      adminLevel: new FormControl('2') // Default value for adminLevel
    });
   }
   loadBuildings(): void {
    this.residentsService.getBuildings().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.buildingOptions = response.data;
        } else {
          this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
        }
      },
      error: (error) => {
        this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
      }
    });
  }

  loadFloors(): void {
    this.residentsService.getFloors().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.floorOptions = response.data;
        } else {
          this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
        }
      },
      error: (error) => {
        this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
      }
    });
  }

  loadDoors(): void {
    this.residentsService.getDoors().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.doorOptions = response.data;
        } else {
          this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
        }
      },
      error: (error) => {
        this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
      }
    });
  }

  loadCommonCosts(): void {
    this.residentsService.getCommoncosts().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.commoncostOptions = response.data;
        } else {
          this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
        }
      },
      error: (error) => {
        this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
      }
    });
  }

  loadSquareMeters(): void {
    this.residentsService.getSquareMeters().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.squareMeterOptions = response.data;
        } else {
          this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
        }
      },
      error: (error) => {
        this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
      }
    });
  }

  closeModal() {
    this.activeModal.close();
  }

  onSave() {
    this.errorMessage = '';
    if (this.validateForm()) {
    console.log(
      `name: ${this.name}\n` +
      `email: ${this.email}\n` +
      `phone: ${this.phone}\n` +
      `building: ${this.building}\n` +
      'newBuilding: ' + this.newBuilding + '\n' +
      `floor: ${this.floor}\n` +
      'newFloor: ' + this.newFloor + '\n' +
      `door: ${this.door}\n` +
      'newDoor: ' + this.newDoor + '\n' +
      `squareMeter: ${this.squareMeter}\n` +
      'newSquareMeter: ' + this.newSquareMeter + '\n' +
      `commoncostBase: ${this.commoncostBase}\n` +
      'newCommoncost: ' + this.newCommoncost + '\n' +
      `balance: ${this.balance}\n` +
      `adminLevel: ${this.adminLevel}\n` +
      `isMeter: ${this.isMeter}`,
      this.activeModal.close()
    );
  }
   

  }
  
    validateForm(): boolean {
      if (!this.name) {
        this.errorMessage = 'Név mező kitöltése kötelező!';
        return false;
      }

      if(!this.email) {
        this.errorMessage = 'Email címet kötelező megadni!';
        return false;
        } 

        if (!this.isValidEmail(this.email)) {
          this.errorMessage = 'Érvénytelen email cím!';
          return false;
        }
      return true;
    }

    isValidEmail(email: string): boolean {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}
