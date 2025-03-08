import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import { MenuComponent } from '../menu/menu.component';
import { ResidentsService } from '../../../shared/services/residents.service';
import { MessageService } from '../../../shared/services/message.service';
import { MenuService } from '../../services/menu.service';
import { ChangePasswordService } from '../../../shared/services/changepassword.service';
import { ConfirmmodalComponent } from '../../../shared/sharedcomponents/confirmmodal/confirmmodal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageComponent } from "../../../shared/sharedcomponents/message/message.component";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MenuComponent, FormsModule, MessageComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {

  residentData: any = {};
  userId: any = null;
  settings: any = {};

  editingField: string | null = null; 
  rawPhoneNum: string = '';
  isPhoneAreaValid: boolean = true;
  isRawPhoneNumValid: boolean = true;
  phoneError = false;
  phoneAreaError: boolean = false;
  phoneNumError: boolean = false;
  isValidEmail: boolean = true;

  editingPassword = false;
  oldPassword: string = '';
  newPassword: string = '';
  newPasswordAgain: string = '';
  passwordError = false;
  twoPasswordError = false;


  constructor(private router: Router,
    private residentsService: ResidentsService,
    private messageService: MessageService,
    private menuService: MenuService,
    private modalService: NgbModal,
    private changePasswordService: ChangePasswordService
  ) { }
  async ngOnInit() {
    this.userId = this.menuService.getCurrentUserDatas();
    this.settings = await this.menuService.inicialize();
    this.loadUserData(this.userId).then((data) => {
    });

  }
  
  loadUserData(userId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.residentsService.getResidentDatasById(userId).subscribe({
        next: (response) => {
          if (response.status === 'success') {  
            const data = response.data;
            const { areaNum, phoneNum } = this.splitPhoneNumber(data.phone);
  
            const settingsObj = this.settings.find((item: any) => item.settings)?.settings || {};
            this.residentData = {
              username: data.username,
              email: data.email,
              previousEmail: data.email,
              building: data.typeOfBuildings,
              floor: data.typeOfFloors,
              door: data.typeOfDoors,
              squareMeter: data.typeOfSquareMeters,
              balance: data.balance,
              adminLevel: data.adminLevel,
              isMeter: data.isMeters,
              phoneAreaNum: areaNum,
              previousPhoneAreaNum: areaNum,
              phoneNum: phoneNum,
              previousPhoneNum: phoneNum,
              cold1: settingsObj.cold1,
              cold2: settingsObj.cold2,
              hot1: settingsObj.hot1,
              hot2: settingsObj.hot2,
              heating: settingsObj.heating,
              serialNumbers: {
                cold1: data.cold1SerialNumber,
                cold2: data.cold2SerialNumber,
                hot1: data.hot1SerialNumber,
                hot2: data.hot2SerialNumber,
                heating: data.heatingSerialNumber
              }
            };
  
            resolve(this.residentData); 
          } else {
            this.messageService.setErrorMessage("Hiba történt az adatok betöltése során. Próbáld meg később!");
            reject("Hiba történt az adatok betöltése során.");
          }
        },
        error: (err) => {
          console.error("API hiba:", err);
          reject(err);
        }
      });
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

  isSerialNumberEmpty(value: string): string {
    return value && value !== '0' ? value : 'N/A';
  }
   logout() {
      const modalRef = this.modalService.open(ConfirmmodalComponent, { centered: true, size: 'sm' });
      modalRef.componentInstance.confirmMessage = 'Biztosan ki szeretne jelentkezni?'; 
  
        modalRef.result.then(
          (result) => {
            if (result === 'confirmed') {
              localStorage.removeItem('currentUser');
              sessionStorage.removeItem('currentUser');
              this.router.navigate(['/login']);
            }
          },
          (reason) => {
            console.log('Hiba a modal bezárásakor:', reason);
          }
        );
    }

  startEditing(field: string) {
    this.editingField = field;
    if (field === 'phone') {
      this.residentData.phoneNum = this.residentData.phoneNum.replace(/\D/g, '');
    }
    this.residentData.previousEmail = this.residentData.email;
  }

  stopEditing() {
    if (this.editingField === 'email') {
      if (!this.isValidEmail) {
        this.residentData.email = this.residentData.previousEmail;
        this.editingField = null;
        return;
      }
    }
  
    if (this.editingField === 'phone') {
      if (this.phoneNumError) {
        this.phoneError = true; 
        this.residentData.phoneNum = this.residentData.previousPhoneNum; 
        this.editingField = null;
        this.phoneNumError = false;
        return;
      }

      if(this.phoneAreaError) {
        this.phoneError = true; 
        this.residentData.phoneAreaNum = this.residentData.previousPhoneAreaNum; 
        this.editingField = null;
        this.phoneAreaError = false;
        return;
      }
      this.phoneError = false; 
      this.residentData.phoneNum = this.formatPhoneNumber(this.residentData.phoneNum);
    }
  
    if (this.editingField === 'username') {
      this.residentData.username = this.residentData.username
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
  
    if (this.editingField !== null) {
      const fieldValue = this.getFieldValue(this.editingField);
    
      this.residentsService.updateDatasByUser(this.userId, this.editingField, fieldValue).subscribe({
        next: (response) => {
          if (response && response.status === 'success') {
            this.messageService.setMessage('A módosítások mentve.');
          } else {
            this.messageService.setErrorMessage('Hiba történt az adatok mentése során. Próbáld meg később!');
          }
        },
        error: () => {
          this.messageService.setErrorMessage('Hiba történt az adatok mentése során. Próbáld meg később!');
        }
      });
    }
  
    this.editingField = null;
  }
  


  
  

  getFieldValue(field: string): string {
    switch(field) {
      case 'email':
        return this.residentData.email;
      case 'phone':
        return `${this.residentData.phoneAreaNum} ${this.residentData.phoneNum}`;
      case 'username':
        return this.residentData.username;
      default:
        return '';
    }
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.editable') && !target.closest('.edit-input')) {
      this.stopEditing();
    }
  }

  validatePhoneAreaNum() {
    const phoneAreaNum = this.residentData.phoneAreaNum;
  
    if (!phoneAreaNum || !/^(1|[2-9][0-9])$/.test(phoneAreaNum)) {
      this.phoneAreaError = true;
    } else {
      this.phoneAreaError = false;
    }
  }
  

validatePhoneNum() {
  const phoneNum = this.residentData.phoneNum;
  if (!phoneNum || phoneNum.length !== 7 || !/^[0-9]+$/.test(phoneNum)) {
    this.phoneNumError = true;
  } else {
    this.phoneNumError = false;
  }
}


onPhoneInput(event: any) {
  let phoneNum = event.target.value.replace(/\D/g, ''); 
  if (phoneNum.length <= 7) {
    this.residentData.phoneNum = phoneNum;
  }
}

onPhoneAreaInput(event: any) {
  let phoneAreaNum = event.target.value.replace(/\D/g, ''); 
  if (phoneAreaNum.length <= 2) {
    this.residentData.phoneAreaNum = phoneAreaNum;
  }
}

formatPhoneNumber(phoneNumber: string): string {
  let cleaned = phoneNumber;

  if (cleaned.length === 7) {
    return this.residentData.phoneNum = cleaned.slice(0, 3) + ' ' + cleaned.slice(3, 5) + ' ' + cleaned.slice(5, 7);  }
     else 
     {
    return this.residentData.phoneNum = cleaned; 
  }
}

  validateEmail() {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    this.isValidEmail = emailRegex.test(this.residentData.email);
  }
  
  validateEmailOnBlur(inputElement: HTMLInputElement): void {
    if (!this.isValidEmail) {
      this.residentData.email = this.residentData.previousEmail;  
    }
  }
  
  startEditingPassword() { 
      this.editingPassword = true;
      this.newPassword = '';
      this.newPasswordAgain = '';
      this.oldPassword = '';
  
  }

  validatePassword() {
    this.passwordError = this.newPassword.length < 6;
    this.twoPasswordError = this.newPassword !== this.newPasswordAgain;
}

savePassword() {
  this.validatePassword();
  if (this.passwordError || this.twoPasswordError) {
      return;
  }
  if (!this.passwordError && !this.twoPasswordError) {
      this.editingPassword = false;
  }
  this.changePasswordService.changePassword(this.userId, this.oldPassword, this.newPassword).subscribe({
    next: (response) => {
      if (response && response.status === 'success') {
        this.messageService.setMessage('A jelszó sikeresen megváltoztatva!');
        scrollTo(0, 0);
      } else {
        this.messageService.setErrorMessage('Hiba történt a jelszó mentése során: ' + (response.message || 'Ismeretlen hiba.'));
        scrollTo(0, 0);
        this.oldPassword = '';
        this.newPassword = '';
        this.newPasswordAgain = '';
      }
    },
    error: (err) => {
      const errorMessage = err.error?.message || 'Próbáld meg később!';
      this.messageService.setErrorMessage('Hiba történt a jelszó mentése során: ' + errorMessage);
      scrollTo(0, 0);
      this.oldPassword = '';
        this.newPassword = '';
        this.newPasswordAgain = '';
    }
  });
}



  cancelModifyingPassword() {
    this.editingPassword = false;
    this.passwordError = false;
    this.twoPasswordError = false;  
}
}
