import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { MessageService } from '../../../../shared/services/message.service';
import { ResidentsService } from '../../../services/residents.service';
import { ConfirmdeleteresidentComponent } from '../confirmdeleteresident/confirmdeleteresident.component';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-addresident',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ],
  providers: [],
  templateUrl: './addAndEditResident.component.html',
  styleUrl: './addAndEditResident.component.css'
})
export class AddAndEditResidentComponent implements OnInit {

  @Input() commonCost: string | undefined;
  @Input() amountSmeter: number | undefined;
  @Input() amountFix: number | undefined;
  @Input() subDepSmeter: number | undefined;
  @Input() subDepFix: number | undefined;
  @Input() cold1: string = '';
  @Input() cold2: string = '';
  @Input() hot1: string = '';
  @Input() hot2: string = '';
  @Input() heating: string = '';
  @Input() userId: number | undefined;

  
  form: FormGroup | undefined;

  errorMessage: string | undefined;
  message: string | undefined;

  loadErrorMessage = "Hiba történt az adatok betöltése során. Próbáld meg később!";
  updateErrorMessage = "Hiba történt az adatok frissítése során. Próbáld meg később!";

  username: string | undefined;
  email: string | undefined;
  phoneNum: string = '';

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

  subDeposit: string | undefined;
  subDepositOptions : any[] = [];
  newSubDeposit: string | undefined;

  squareMeter: string | undefined;
  squareMeterOptions : any[] = [];
  newSquareMeter: string | undefined;

  balance: number = 0;

  adminLevel: number = 2;

  isMeter: number = 1;

  phoneAreaNum: string = '1';

  cold1SerialNumber: string = '';
  cold2SerialNumber: string = '';
  hot1SerialNumber: string = '';
  hot2SerialNumber: string = '';

  isLoading = true;
  pendingRequests: number = 0;



  constructor(private activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private residentsService: ResidentsService,
    public messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.isLoading = true; // Kezdjük a betöltést
  
    this.loadOptions(() => this.residentsService.getBuildings(), 'typeOfBuildings', 'buildingOptions');
    this.loadOptions(() => this.residentsService.getFloors(), 'typeOfFloors', 'floorOptions');
    this.loadOptions(() => this.residentsService.getDoors(), 'typeOfDoors', 'doorOptions');
    this.loadOptions(() => this.residentsService.getCommoncosts(), 'typeOfCommoncosts', 'commoncostOptions');
    this.loadOptions(() => this.residentsService.getSquareMeters(), 'typeOfSquareMeters', 'squareMeterOptions');
    this.loadOptions(() => this.residentsService.getSubdeposits(), 'typeOfSubdeposits', 'subDepositOptions');
  
    if (this.userId !== undefined) {
      this.loadUserData(this.userId);
    }
  
    this.setForm();
  }
  
  

   loadUserData(userId: number): void {
    this.residentsService.getResidentDatasById(userId).subscribe({
      next: (response) => {
        if (response.status === 'success') {

        
          console.log('rd', response.data);
          const data = response.data;

          const { areaNum, phoneNum } = this.splitPhoneNumber(data.phone);
          this.phoneAreaNum = areaNum;
          this.phoneNum = phoneNum;

          this.username = data.username;
          this.email = data.email;
          this.building = data.typeOfBuildings;
          this.floor = data.typeOfFloors;
          this.door = data.typeOfDoors;
          this.squareMeter = data.typeOfSquareMeters;
          this.commoncostBase = data.typeOfCommoncosts;
          this.subDeposit = data.typeOfSubdeposits;
          this.balance = data.balance;
          this.adminLevel = data.adminLevel;
          this.isMeter = data.isMeters;
          this.cold1SerialNumber = data.cold1SerialNumber;
          this.cold2SerialNumber = data.cold2SerialNumber;
          this.hot1SerialNumber = data.hot1SerialNumber;
          this.hot2SerialNumber = data.hot2SerialNumber;
        } else {
          this.messageService.setErrorMessage(this.loadErrorMessage);
        }
      },  
    });
  }
  
  splitPhoneNumber(phoneNumber: string): { areaNum: string, phoneNum: string } {
    const parts = phoneNumber.split(' ');
    let areaNum = '';
    let phoneNum = '';
  
    if (parts.length > 1) {
      areaNum = parts[0];
      phoneNum = parts.slice(1).join(' ');
    } 

    return { areaNum, phoneNum };
  }
  

   setForm() {
    this.form = new FormGroup({
      username: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phoneAreaNum: new FormControl(''),
      phoneNum: new FormControl(''),
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
      subDeposit: new FormControl(''),
      balance: new FormControl(''),
      isMeter: new FormControl(''),
      adminLevel: new FormControl('2'),
     
      cold1SerialNumber: new FormControl(''),
      cold2SerialNumber: new FormControl(''),
      hot1SerialNumber: new FormControl(''),
      hot2SerialNumber: new FormControl('')
    });
   }
   
   private loadOptions(endpoint: () => Observable<any>, sortKey: string, optionsField: keyof this): void {
    this.pendingRequests++;
    endpoint().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          (this as any)[optionsField] = this.sortArrayAlphabetically(response.data, sortKey);
        } else {
          this.messageService.setErrorMessage(this.loadErrorMessage);
        }
      },
      error: () => {
        this.messageService.setErrorMessage(this.loadErrorMessage);
      },
      complete: () => {
        this.pendingRequests--;
        if (this.pendingRequests === 0) {
          this.isLoading = false;
        }
      }
    });
  }
  
  
  
  closeModal() {
    this.activeModal.close();
  }

  onSave(userId: number | undefined) {
    if(!userId){
      this.addNewResident();

    }
    if(userId){ 
      this.updateResident(userId);
    } 

  }

  addNewResident() {
    this.errorMessage = '';
    if (this.validateForm()) {
      const data = this.setResidentData();
  
      this.residentsService.saveData(data)
        .subscribe(
          () => {
            this.messageService.setMessage('Lakó sikeresen mentve.');
            this.activeModal.close();
          },
          () => {
            this.messageService.setErrorMessage(this.loadErrorMessage);
            this.errorMessage = this.loadErrorMessage;
          }
        );
        }
  }

  updateResident(userId: number) {
    console.log('editResident', userId);
    this.errorMessage = '';
    if (this.validateForm()) {
      const data = this.setResidentData();
      console.log(data);

      this.residentsService.updateData(data)
      .subscribe(
        () => {
          this.messageService.setMessage('Lakó adatai sikeresen frissítve.');
          this.activeModal.close();
        },
        () => {
          this.messageService.setErrorMessage(this.updateErrorMessage);
          this.errorMessage = this.updateErrorMessage;
        }
      );
      }
    }
  
   setResidentData() {
    const data = {
      id: this.userId,
      username: this.username,
      email: this.email,
      phone: `${this.phoneAreaNum} ${this.phoneNum}`,
      building: this.building || this.newBuilding,
      floor: this.floor || this.newFloor,
      door: this.door || this.newDoor,
      squareMeter: this.squareMeter || this.newSquareMeter,
      commoncost: this.commoncostBase || this.newCommoncost || 0,
      balance: this.balance,
      adminLevel: this.adminLevel,
      isMeter: this.isMeter,
      cold1: this.cold1,
      cold2: this.cold2,
      hot1: this.hot1,
      hot2: this.hot2,
      cold1SerialNumber: this.cold1SerialNumber,
      cold2SerialNumber: this.cold2SerialNumber,
      hot1SerialNumber: this.hot1SerialNumber,
      hot2SerialNumber: this.hot2SerialNumber,
      subDeposit: this.subDeposit || this.newSubDeposit || 0
    };
    return data;
   }

   deleteUser(userId: number) {
    const modalRef = this.modalService.open(ConfirmdeleteresidentComponent, { centered: true, size: 'sm' });
    modalRef.result.then(
      (result) => {
        if (result === 'confirmed') {
          this.residentsService.deleteResident(userId).subscribe(() => {
            this.messageService.setMessage('Lakó sikeresen törölve.');
            this.activeModal.close(); // Biztosítsd, hogy az activeModal-ra megfelelően hivatkozol.
          });
        }
      },
      (reason) => {
        // A modal bezárásakor (pl. cancel vagy close)
      }
    );
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
        this.phoneNum = cleaned;
      } else if (cleaned.length <= 5) {
        this.phoneNum = `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
      } else {
        this.phoneNum = `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)}`;
      }

    }
  
    allowOnlyNumbers(event: KeyboardEvent) {
      const charCode = event.which ? event.which : event.keyCode;
      if ((charCode < 48 || charCode > 57) && charCode !== 46 && charCode !== 44) {
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
              this.commoncostBase = '';
              break;
          case 'subDeposit':
              this.subDeposit = '';
              break;
          default:
              break;
      }
  }

  resetInputField(fieldName: string): void {
    if (fieldName === 'newBuilding') {
      this.newBuilding = '';
    } else if (fieldName === 'newFloor') {
      this.newFloor = '';
    } else if (fieldName === 'newDoor') {
      this.newDoor = '';
    } else if (fieldName === 'newSquareMeter') {
      this.newSquareMeter = '';
    } else if (fieldName === 'newCommoncost') {     
      this.newSubDeposit = '';
      this.newCommoncost = '';
    }else if (fieldName === 'newSubDeposit') {
      this.newSubDeposit = '';
    }
  }



  updateCommonCost(): void {
    const selectedSquareMeterOption = this.squareMeterOptions.find(option => option.typeOfSquaremeters === this.squareMeter);
    if (selectedSquareMeterOption) {
        const matchingCommonCostOption = this.commoncostOptions.find(option => option.id === selectedSquareMeterOption.ccostForThis);
        if (matchingCommonCostOption) {
            this.commoncostBase = matchingCommonCostOption.typeOfCommoncosts;
            this.updateSubDeposit();
        } else {
            this.commoncostBase = '';
            this.updateSubDeposit();

        }
    } else {
        this.commoncostBase = '';
        this.updateSubDeposit();

    }
}

updateSubDeposit(): void {
  const selectedSquareMeterOption = this.squareMeterOptions.find(option => option.typeOfSquaremeters === this.squareMeter);
  if (selectedSquareMeterOption && selectedSquareMeterOption.subDepForThis !== '') {
      const selectedSubDepositOption = this.subDepositOptions.find(option => option.id === selectedSquareMeterOption.subDepForThis);
      if (selectedSubDepositOption) {
          this.subDeposit = selectedSubDepositOption.typeOfSubdeposits;
      } else {
          this.subDeposit = '';
      }
  } else {
      this.subDeposit = '';
  }
}




  
  get showCold1Input(): boolean {
    return this.cold1 === '1';
  }

  get showCold2Input(): boolean {
    return this.cold2 === '1';
  }

  get showHot1Input(): boolean {
    return this.hot1 === '1';
  }

  get showHot2Input(): boolean {
    return this.hot2 === '1';
  }
  
  sortArrayAlphabetically(data: any[], key: string): any[] {
    return data.sort((a, b) => {
      const numA = parseFloat(a[key]);
      const numB = parseFloat(b[key]);
      
      return numA - numB;
    });
  }
  
  
    
}



