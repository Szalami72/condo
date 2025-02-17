import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MetersService } from '../../../services/meters.service';
import { MessageService } from '../../../../shared/services/message.service';
import { ResidentsService } from '../../../services/residents.service';
import { ConfirmmodalComponent } from '../../../../shared/sharedcomponents/confirmmodal/confirmmodal.component';
import { map, Observable } from 'rxjs';


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
  @Input() cold1: boolean = false;
  @Input() cold2: boolean = false;
  @Input() hot1: boolean = false;
  @Input() hot2: boolean = false;
  @Input() heating: boolean = false;
  @Input() severally: boolean = false;
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

  heatingSerialNumber: string = '';

  cold1LastValue: number = 0;
  cold2LastValue: number = 0;
  hot1LastValue: number = 0;
  hot2LastValue: number = 0;
  heatingLastValue: number = 0;

  cold1PrevValue: number = 0;
  cold2PrevValue: number = 0;
  hot1PrevValue: number = 0;
  hot2PrevValue: number = 0;
  heatingPrevValue: number = 0;

  isLoading = false;
  pendingRequests: number = 0;

  metersTypes: any[] = [];

  monthAndYear: string = '';



  constructor(private activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private residentsService: ResidentsService,
    public messageService: MessageService,
    private metersService: MetersService

  ) { }

  ngOnInit(): void {
    
    this.isLoading = true; // Kezdjük a betöltést

    if(this.userId !== undefined){ {
      this.loadUserData(this.userId);
    }}
      //console.log('userId', this.userId);
      


    this.loadOptions(() => this.residentsService.getBuildings(), 'typeOfBuildings', 'buildingOptions');
    this.loadOptions(() => this.residentsService.getFloors(), 'typeOfFloors', 'floorOptions');
    this.loadOptions(() => this.residentsService.getDoors(), 'typeOfDoors', 'doorOptions');
    this.loadOptions(() => this.residentsService.getCommoncosts(), 'typeOfCommoncosts', 'commoncostOptions');
    this.loadOptions(() => this.residentsService.getSquareMeters(), 'typeOfSquareMeters', 'squareMeterOptions');
    this.loadOptions(() => this.residentsService.getSubdeposits(), 'typeOfSubdeposits', 'subDepositOptions');

    
    
    
    
    
    this.setForm();
  
}
  

loadUserData(userId: number): void {
  this.residentsService.getResidentDatasById(userId).subscribe({
    next: (response) => {
      if (response.status === 'success') {
        console.log(response);

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
        this.heatingSerialNumber = data.heatingSerialNumber;

        this.cold1LastValue = this.cold1PrevValue = data.cold1LastValue;
        this.cold2LastValue = this.cold2PrevValue = data.cold2LastValue;
        this.hot1LastValue = this.hot1PrevValue = data.hot1LastValue;
        this.hot2LastValue = this.hot2PrevValue = data.hot2LastValue;
        this.heatingLastValue = this.heatingPrevValue = data.heatingLastValue;

        // Check if serial numbers are non-empty and set true/false accordingly
        if(this.severally) {
          this.cold1 = data.cold1SerialNumber ? true : false;
          this.cold2 = data.cold2SerialNumber ? true : false;
          this.hot1 = data.hot1SerialNumber ? true : false;
          this.hot2 = data.hot2SerialNumber ? true : false;
          this.heating = data.heatingSerialNumber ? true : false;
        }
        
        
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
      hot2SerialNumber: new FormControl(''),
      heatingSerialNumber: new FormControl(''),

      cold1LastValue: new FormControl(''),
      cold2LastValue: new FormControl(''),
      hot1LastValue: new FormControl(''),
      hot2LastValue: new FormControl(''),
      heatingLastValue: new FormControl(''),
  
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
          (response: any) => {
            if (response.success) {
              this.messageService.setMessage('Lakó sikeresen mentve.');
              this.activeModal.close();
            } else {
              this.messageService.setErrorMessage(response.message);
              this.errorMessage = response.message;
            }
          },
          () => {
            this.messageService.setErrorMessage('Ismeretlen hiba történt.');
            this.errorMessage = 'Ismeretlen hiba történt.';
          }
        );
    }
  }
  
  
  getCurrentMonthAndYear(): string {
    const currentDate = new Date();
    const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
    const year = currentDate.getFullYear();

    return `${month}-${year}`;
  }

  generatePassword(length: number): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }

  updateResident(userId: number) {
    console.log('editResident', userId);
    this.errorMessage = '';
  
    if (this.validateForm()) {
      const isChanged = this.compareValues();
  
      this.isRecordedMonthlyValues(userId).subscribe(data => {
        const prevMeterValues = data;
        const isRecorded = this.checkIfMonthExists(data, this.getCurrentMonthAndYear());
  
        this.setNewMetersValues(isChanged, isRecorded, prevMeterValues);
  
        const datas = this.setResidentData();
        console.log('datas', datas);
  
        this.residentsService.updateData(datas)
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
      });
    }
  }
  
    
    setNewMetersValues(isChanged: boolean, isRecorded: number | boolean, prevMeterValues: any[]): void {
      // Alapértelmezett hónap és év beállítása
      let newMonthAndYear = this.getCurrentMonthAndYear();
      console.log('Eredeti mayId:', newMonthAndYear);
    
      if (!isChanged) {
        // Ha nincs változás, nézzük meg az utolsó rögzített értéket
        const lastRecord = prevMeterValues[0] || {};
    
        if (!lastRecord || Object.keys(lastRecord).length === 0) {
          // Ha nincs előző érték, egy hónappal visszaállítjuk
          newMonthAndYear = this.decreaseMonth(newMonthAndYear);
        }
      } else {
        // Ha változott valami, attól függően állítunk be értéket, hogy már rögzítették-e
        newMonthAndYear = isRecorded ? this.getCurrentMonthAndYear() : this.decreaseMonth(newMonthAndYear);
      }
    
      // Végső érték beállítása és kiírása
      this.monthAndYear = newMonthAndYear;
      console.log('Végső mayId:', this.monthAndYear);
    }
    
    decreaseMonth(monthAndYear: string): string {
      const [month, year] = monthAndYear.split('-').map(num => parseInt(num, 10));
      console.log("month:", month, "year:", year);
      let newMonth = month - 1;
      let newYear = year;
    
      if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      }
    
      const formattedMonth = newMonth.toString().padStart(2, "0");
      return `${formattedMonth}-${newYear}`;
    }
    
    checkIfMonthExists(data: any[], currentMonthAndYear: string): number | boolean {
      return data.some(item => item.monthAndYear === currentMonthAndYear); 
    }
    
    compareValues(): boolean {
      return this.cold1PrevValue !== this.cold1LastValue ||
             this.cold2PrevValue !== this.cold2LastValue ||
             this.hot1PrevValue !== this.hot1LastValue ||
             this.hot2PrevValue !== this.hot2LastValue ||
             this.heatingPrevValue !== this.heatingLastValue;
    }
    
   
    isRecordedMonthlyValues(userId: number): Observable<any[]> {
      return this.metersService.getPreviousMetersValues(userId).pipe(
        map(response => response.status === 'success' ? response.data : []) // Ha sikeres, visszaadjuk az adatokat, egyébként üres tömböt
      );
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
        heating: this.heating,
        severally: this.severally,
        cold1SerialNumber: this.cold1SerialNumber || 0,
        cold2SerialNumber: this.cold2SerialNumber || 0,  
        hot1SerialNumber: this.hot1SerialNumber || 0,  
        hot2SerialNumber: this.hot2SerialNumber || 0,    
        heatingSerialNumber: this.heatingSerialNumber || 0,    
        subDeposit: this.subDeposit || this.newSubDeposit || 0,
        cold1LastValue: this.cold1LastValue || 0,
        cold2LastValue: this.cold2LastValue || 0,
        hot1LastValue: this.hot1LastValue || 0,
        hot2LastValue: this.hot2LastValue || 0,
        heatingLastValue: this.heatingLastValue || 0,
        monthAndYear: this.monthAndYear,
      };
      console.log('setResidentData', data);
      return data;
    }
    

   deleteUser(userId: number) {
    const modalRef = this.modalService.open(ConfirmmodalComponent, { centered: true, size: 'sm' });
    modalRef.componentInstance.confirmMessage = 'Biztosan törlöd a lakót?'; 

    modalRef.result.then(
      (result) => {
        if (result === 'confirmed') {
          this.residentsService.deleteResident(userId).subscribe(() => {
            this.closeModal();
            this.messageService.setMessage('Lakó sikeresen törölve.');
          });
        }
      },
      (reason) => {
        console.log('Hiba a modal bezárásakor:', reason);
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
    if (this.squareMeter && this.severally) {
      this.updateUsedMeters(this.squareMeter);
    }
}

updateUsedMeters(squareMeter: string): void {

  this.residentsService.getUsedMeters(squareMeter).subscribe({
    
    next: (response) => {
      if (response.status === 'success') {
        this.metersTypes = response.metersTypes;
        this.setUsedMeters();
      } else {
        console.error('Error:', response.message); 
      }
    },
    error: (err) => {
      console.error('Request failed', err); 
    }
  });
 
 
}

setUsedMeters(): void {

  this.cold1 = this.cold2 = this.hot1 = this.hot2 = this.heating = false;

  this.metersTypes.forEach((meterType) => {
    switch (meterType) {
      case 'cold1':
        this.cold1 = true;
        break;
      case 'cold2':
        this.cold2 = true;
        break;
      case 'hot1':
        this.hot1 = true;
        break;
      case 'hot2':
        this.hot2 = true;
        break;
      case 'heating':
        this.heating = true;
        break;
    }
  });
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

  
  sortArrayAlphabetically(data: any[], key: string): any[] {
    return data.sort((a, b) => {
      const numA = parseFloat(a[key]);
      const numB = parseFloat(b[key]);
      
      return numA - numB;
    });
  }
  
  
    
}



