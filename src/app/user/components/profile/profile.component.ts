import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import { MenuComponent } from '../menu/menu.component';
import { ResidentsService } from '../../../admin/services/residents.service';
import { MessageService } from '../../../shared/services/message.service';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MenuComponent, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {

  residentData: any = {};
  userId: any = null;
  settings: any = {};

  editingField: string | null = null; // Melyik mezőt szerkeszti
  rawPhoneNum: string = '';

  isValidEmail: boolean = true;

  constructor(private router: Router,
    private residentsService: ResidentsService,
    private messageService: MessageService,
    private menuService: MenuService
  ) { }
  async ngOnInit() {
    this.userId = this.menuService.getCurrentUserDatas();
    this.settings = await this.menuService.inicialize();
  console.log('Settings:', this.settings);
    this.loadUserData(this.userId).then((data) => {
      console.log('User Data:', data);
    });

  }
  
  loadUserData(userId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.residentsService.getResidentDatasById(userId).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            console.log('API Response:', response);
  
            const data = response.data;
            const { areaNum, phoneNum } = this.splitPhoneNumber(data.phone);
  
            const settingsObj = this.settings.find((item: any) => item.settings)?.settings || {};
            this.residentData = {
              username: data.username,
              email: data.email,
              building: data.typeOfBuildings,
              floor: data.typeOfFloors,
              door: data.typeOfDoors,
              squareMeter: data.typeOfSquareMeters,
              balance: data.balance,
              adminLevel: data.adminLevel,
              isMeter: data.isMeters,
              phoneAreaNum: areaNum,
              phoneNum: phoneNum,
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
  
            resolve(this.residentData); // Adatok visszaadása, amikor betöltődtek
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
  logout(): void {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  startEditing(field: string) {
    this.editingField = field;
    if (field === 'phone') {
      this.rawPhoneNum = this.residentData.phoneNum.replace(/\D/g, ''); // Csak számokat hagyunk meg
    }
  }

  stopEditing() {
    if (this.editingField === 'phone') {
      this.formatPhone();
    }

    if (this.editingField === 'username') {
      this.residentData.username = this.residentData.username
        .split(' ') // Szétválasztjuk a szavakat
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Minden szót nagybetűssé alakítunk
        .join(' '); // Újra összefűzzük a szavakat
    }
    
    const editedField = this.editingField;
    const fieldValue = editedField ? this.getFieldValue(editedField) : ''; // Az aktuális érték lekérése

  // Kiírjuk a szerkesztett mezőt és annak aktuális értékét
  console.log(`Edited Field: ${editedField}, Value: ${fieldValue}`);
  if (editedField !== null) {
    this.residentsService.updateDatasByUser(this.userId, editedField, fieldValue).subscribe({
      next: (response) => {
        if (response && response.hasOwnProperty('status')) {
          if (response.status === 'success') {
            console.log('Update successful');
          } else {
            console.error('API error, status not success:', response);
          }
        } else {
          console.error('Invalid response format:', response);
        }
      },
      
    })
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

  onPhoneInput(event: any) {
    let cleaned = event.target.value.replace(/\D/g, ''); // Csak számokat engedünk be

    if (cleaned.length > 7) {
      cleaned = cleaned.slice(0, 7); // Maximum 7 számjegy
    }

    this.rawPhoneNum = cleaned;
  }

  formatPhone() {
    let cleaned = this.rawPhoneNum;

    if (cleaned.length === 7) {
      this.residentData.phoneNum = `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)}`;
    } else {
      this.residentData.phoneNum = cleaned; // Ha nem 7 számjegy, nem formázunk
    }
  }

  validateEmail() {
    // Egyszerű reguláris kifejezés az email cím validálására
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    this.isValidEmail = emailRegex.test(this.residentData.email);
  }

  validateEmailOnBlur() {
    if (!this.isValidEmail) {
      // Ha invalid, töröljük a hibás értéket, hogy az üres legyen
      this.residentData.email = 'N/A';
    }
  }
}
