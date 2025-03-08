import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../menu/menu.component';
import { MenuService } from '../../services/menu.service';
import { FilesService } from '../../../admin/services/files.service';
import { MessageService } from '../../../shared/services/message.service';
import { ResidentsService } from '../../../admin/services/residents.service';
import { NotificationService } from '../../services/notification.service';
import { FILE_UPLOAD_URL } from '../../../constans/constans';

@Component({
  selector: 'app-files',
  standalone: true,
  imports: [MenuComponent, CommonModule],
  templateUrl: './files.component.html',
  styleUrl: './files.component.css'
})
export class FilesComponent implements OnInit {
  uploadedFiles: any[] = [];
  datas: any[] = [];
  lastVisitedTime: Date | null = null;
  lastLoginTime: Date | null = null;

  constructor(private menuService: MenuService,
    private filesService: FilesService,
    private messageService: MessageService,
    private residentsService: ResidentsService,
    private notificationService: NotificationService
  ) { }
  async ngOnInit() {
    const currentUser = this.getCurrentUserDatas();
    if (currentUser) {
      this.loadLastVisitedTime(currentUser.id);   
      this.loadData(currentUser.id);
    }
  
  }
  
  async loadData(userId: number): Promise<void> {
    this.getLoginHistory(userId);
    
    try {
      const getDatas = await this.menuService.inicialize();
      this.uploadedFiles = getDatas.find((item: { files: any }) => item.files)?.files || [];
      
      // Ellenőrizzük, hogy vannak új fájlok, és ha igen, akkor beállítjuk a státuszt
      if (this.uploadedFiles.length > 0) {
        const hasNewFiles = this.uploadedFiles.some(file => this.isNewFile(file.created_at));
        this.notificationService.setNewFileStatus(hasNewFiles);
        this.saveLastVisitedTime(userId);  // Frissítjük az utolsó látogatott időt
      }
    } catch (error) {
      console.error("Hiba az adatok betöltése közben:", error);
    }
  }
  
  private saveLastVisitedTime(userId: number): void {
    const now = new Date().toISOString();
    localStorage.setItem(`lastVisitedTime_files_${userId}`, now);
  }
  
  
  private loadLastVisitedTime(userId: string): void {
    const storedTime = localStorage.getItem(`lastVisitedTime_files_${userId}`);
    console.log('storedTime:', storedTime);
    this.lastVisitedTime = storedTime ? new Date(storedTime) : this.lastLoginTime || null;
  }
  downloadFile(file: any) {
    this.filesService.getFileById(file.id).subscribe(
      (response: any) => {
        if (response.status === 'success') {
          const fileData = response.data;
          // const fileUrl = fileData.filePath;
          const fileUrl = FILE_UPLOAD_URL + fileData.fileName; // fileData.fileName tartalmazza a fájl nevét
          console.log('fileUrl:', fileUrl);
  
          // Egy rejtett link elem létrehozása a fájl letöltéséhez
          const link = document.createElement('a');
          link.href = fileUrl;
          link.target = '_blank';
          link.download = fileData.fileName;  // A fájl neve a szerver válaszából
          link.click();
        } else {
          this.messageService.setErrorMessage('Hiba történt a fájl letöltése során.');
        }
      },
      (error: any) => {
        console.log('Hiba:', error);
        this.messageService.setErrorMessage('Hiba történt a fájl letöltése során.');
      }
    );
  }

  private getCurrentUserDatas(): any {
    const currentUserData = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (currentUserData) {
      const parsedData = JSON.parse(currentUserData);
      parsedData.id = Number(parsedData.id);
      return parsedData;
    }
    return null;
  }
 
  isNewFile(createdAt: string): boolean {
    if (!this.lastVisitedTime) return true; // Első belépéskor minden fájl új
    return new Date(createdAt) > this.lastVisitedTime; // Ha a fájl időpontja későbbi, mint az utolsó látogatott idő
  }

  private getLoginHistory(id: number): void {
    this.residentsService.getLoginHistory(id).subscribe({
      next: (response) => {
        this.lastLoginTime = response.data.length > 1 ? new Date(response.data[1].loginTime) : new Date('2024-01-01T00:00:00');
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
}
