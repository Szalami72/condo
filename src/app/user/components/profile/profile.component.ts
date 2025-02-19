import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MenuComponent } from '../menu/menu.component';
import { ResidentsService } from '../../../admin/services/residents.service';
import { MessageService } from '../../../shared/services/message.service';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MenuComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {

  residentData: any = {};
  userId: any = null;
  settings: any = {};

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
}
