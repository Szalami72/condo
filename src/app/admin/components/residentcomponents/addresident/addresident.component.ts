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
  @Input() cold1: number | undefined;
  @Input() cold2: number | undefined;
  @Input() hot1: number | undefined;
  @Input() hot2: number | undefined;
  @Input() heating: string | undefined;
  
  form: FormGroup | undefined;

  errorMessage: string | undefined;
  message: string | undefined;

  username: string | undefined;
  email: string | undefined;
  phone: string = '';

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

  phoneAreaNum: number = 1;


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
    // this.errorMessage = '';
    // if (this.validateForm()) {
    // console.log(
    //   `name: ${this.name}\n` +
    //   `email: ${this.email}\n` +
    //   `phone: ${this.phoneAreaNum} ${this.phone}\n` +
    //   `building: ${this.building}\n` +
    //   'newBuilding: ' + this.newBuilding + '\n' +
    //   `floor: ${this.floor}\n` +
    //   'newFloor: ' + this.newFloor + '\n' +
    //   `door: ${this.door}\n` +
    //   'newDoor: ' + this.newDoor + '\n' +
    //   `squareMeter: ${this.squareMeter}\n` +
    //   'newSquareMeter: ' + this.newSquareMeter + '\n' +
    //   `commoncostBase: ${this.commoncostBase}\n` +
    //   'newCommoncost: ' + this.newCommoncost + '\n' +
    //   `balance: ${this.balance}\n` +
    //   `adminLevel: ${this.adminLevel}\n` +
    //   `isMeter: ${this.isMeter}`,
    //   this.activeModal.close()
    // );
    this.errorMessage = '';
  if (this.validateForm()) {
    const data = {
      name: this.username,
      email: this.email,
      phone: `${this.phoneAreaNum} ${this.phone}`,
      building: this.building,
      newBuilding: this.newBuilding,
      floor: this.floor,
      newFloor: this.newFloor,
      door: this.door,
      newDoor: this.newDoor,
      squareMeter: this.squareMeter,
      newSquareMeter: this.newSquareMeter,
      commoncostBase: this.commoncostBase,
      newCommoncost: this.newCommoncost,
      balance: this.balance,
      adminLevel: this.adminLevel,
      isMeter: this.isMeter
    };

    this.residentsService.saveData(data)
      .subscribe(
        response => {
          this.messageService.setMessage('Lakó sikeresen mentve.');
          this.activeModal.close();
        },
        error => {
          this.messageService.setErrorMessage('Hiba történt a mentés során. Próbáld meg később!');
          this.errorMessage = 'Hiba történt a mentés során.';
        }
      );
  }
  }
   
  
    validateForm(): boolean {
      if (!this.username) {
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

    capitalizeName() {
      if (this.username) {
        this.username = this.username
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }

    allowOnlyLetters(event: KeyboardEvent) {
      const charCode = event.which ? event.which : event.keyCode;
      // Engedélyezzük a magyar ábécé betűit (a-z, A-Z, é, á, í, ó, ö, ő, ú, ü, ű, É, Á, Í, Ó, Ö, Ő, Ú, Ü, Ű) és a szóközt (32)
      if (
        (charCode < 65 || charCode > 90) &&
        (charCode < 97 || charCode > 122) &&
        (charCode !== 32) &&
        (charCode !== 233) && // é
        (charCode !== 225) && // á
        (charCode !== 237) && // í
        (charCode !== 243) && // ó
        (charCode !== 246) && // ö
        (charCode !== 337) && // ő
        (charCode !== 250) && // ú
        (charCode !== 252) && // ü
        (charCode !== 369) && // ű
        (charCode !== 201) && // É
        (charCode !== 193) && // Á
        (charCode !== 205) && // Í
        (charCode !== 211) && // Ó
        (charCode !== 214) && // Ö
        (charCode !== 336) && // Ő
        (charCode !== 218) && // Ú
        (charCode !== 220) && // Ü
        (charCode !== 368)    // Ű
      ) {
        event.preventDefault();
      }
    }
    
    
    formatPhone(event: any) {
      const cleaned = event.replace(/\D/g, '');
  
      if (cleaned.length <= 3) {
        this.phone = cleaned;
      } else if (cleaned.length <= 5) {
        this.phone = `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
      } else {
        this.phone = `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)}`;
      }

    }
  
    allowOnlyNumbers(event: KeyboardEvent) {
      const charCode = event.which ? event.which : event.keyCode;
      if (charCode < 48 || charCode > 57) {
        event.preventDefault();
      }
    }

    resetRadioSelection(groupName: string) {
      switch (groupName) {
          case 'building':
              this.building = '';
              break;
          case 'door':
              this.door = '';
              break;
          case 'floor':
              this.floor = '';
              break;
          case 'commonCost':
              this.commoncostBase = '';
              break;
          case 'squareMeter':
              this.squareMeter = '';
              break;
              default:
              break;
      }
  }
  
  
    
}

// TODO
// vízórák szériaszám rögzítése
// ha négyzetméterre kattint akkor ha van hozzátartozó közös költség akkor jelölje a radio gombokon
// jelszó generálás, email küldés