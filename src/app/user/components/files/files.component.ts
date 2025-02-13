import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../menu/menu.component';
import { MenuService } from '../../services/menu.service';
import { FilesService } from '../../../admin/services/files.service';
import { MessageService } from '../../../shared/services/message.service';

@Component({
  selector: 'app-files',
  standalone: true,
  imports: [MenuComponent, CommonModule],
  templateUrl: './files.component.html',
  styleUrl: './files.component.css'
})
export class FilesComponent implements OnInit {
  uploadedFiles: any[] = [];
  constructor(private menuService: MenuService,
    private filesService: FilesService,
    private messageService: MessageService
  ) { }
  async ngOnInit()  {
    await this.menuService.inicialize();
    this.getFiles();
    

  }
//TODO ha van új file az utolsó logintól akkor jelezni!
  getFiles() {

    this.filesService.getFiles().subscribe( 
      (response: any) => {
        if (response && response.status === 'success') {  
          this.uploadedFiles = response.data;
  
        } else if (response && response.status === 'error') {
          this.messageService.setErrorMessage('Hiba az adatok betöltése során. Próbáld meg később!');
        }
      },
      (error: any) => {
        console.log('Hiba:', error);
        this.messageService.setErrorMessage('Hiba az adatok betöltése során. Próbáld meg később!');
      }
    );
  }

  downloadFile(file: any) {
    this.filesService.getFileById(file.id).subscribe(
      (response: any) => {
        if (response.status === 'success') {
          const fileData = response.data;
          // const fileUrl = fileData.filePath;
          const fileUrl = 'http://localhost/condophp/uploads/' + fileData.fileName; // fileData.fileName tartalmazza a fájl nevét
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
}
