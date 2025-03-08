import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { MenuComponent } from '../menu/menu.component';
import { MessageComponent } from '../../../shared/sharedcomponents/message/message.component';
import { MessageService } from '../../../shared/services/message.service';
import { DescriptionService } from '../../services/description.service';
import { FilesService } from '../../services/files.service';

import { InfomodalComponent } from '../../../shared/sharedcomponents/infomodal/infomodal.component';
import { ConfirmmodalComponent } from '../../../shared/sharedcomponents/confirmmodal/confirmmodal.component';

import { FILE_UPLOAD_URL } from '../../../constans/constans';

@Component({
  selector: 'app-files',
  standalone: true,
  imports: [ CommonModule, FormsModule, MenuComponent, MessageComponent ],
  templateUrl: './files.component.html',
  styleUrl: './files.component.css'
})
export class FilesComponent  implements OnInit {

  selectedFile: File | null = null;
  description: string = '';
  uploadedFiles: any[] = [];




constructor(public messageService: MessageService, 
  public descriptionService: DescriptionService, 
  private modalService: NgbModal,
  private filesService: FilesService) { }


ngOnInit(): void {  

  this.getFiles();
 
}
getFilesDescription(openModal: boolean = false): any | string {
  
  let message = '';
  message = this.descriptionService.getFilesDescription();
 
      const modalRef = this.modalService.open(InfomodalComponent, { centered: true });
      modalRef.componentInstance.infoMessage = message;
      return;

}

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
onFileSelected(event: any) {
  this.selectedFile = event.target.files[0] as File;
}

cancel() {
  this.selectedFile = null;
  this.description = '';
  const fileInput = document.querySelector('#file-input') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
}

uploadFile() {
  if (!this.selectedFile) {
    this.messageService.setErrorMessage('Nincs kiválasztott fájl.');
    return;
  }

  const maxFileSizeInMB = 5;
  const maxFileSizeInBytes = maxFileSizeInMB * 1024 * 1024;
  
  if (this.selectedFile.size > maxFileSizeInBytes) {
    this.messageService.setErrorMessage('A fájl mérete túl nagy. Kérlek válassz egy kisebb fájlt.');
    return;
  }

  this.messageService.setErrorMessage('Feltöltés...');
  const formData = new FormData();
  formData.append('file', this.selectedFile, this.selectedFile.name);

  const descriptionToSend = this.description ? this.description : 'null';
  formData.append('description', descriptionToSend);

  this.filesService.saveFile(formData).subscribe(
    (response: any) => {
      
      if (response && response.status === 'success') {
        this.messageService.setErrorMessage('');
        this.messageService.setMessage('A fájl feltöltése sikerült!');
        this.cancel();
        this.getFiles();
      } else if (response && response.status === 'error') {
        this.messageService.setErrorMessage(response.message || 'Ismeretlen hiba történt.');
      } else {
        this.messageService.setErrorMessage('Ismeretlen válasz érkezett a szervertől.');
      }
    },
    (error) => {
      console.log('Hiba:', error);
      this.messageService.setErrorMessage('Hiba történt a fájl feltöltése során.');
    }
  );
}


downloadFile(file: any) {
  this.filesService.getFileById(file.id).subscribe(
    (response: any) => {
      if (response.status === 'success') {
        const fileData = response.data;
        // const fileUrl = fileData.filePath;
        const fileUrl = FILE_UPLOAD_URL + fileData.fileName; // fileData.fileName tartalmazza a fájl nevét
        //console.log('fileUrl:', fileUrl);

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


deleteFile(file: any) {
  const modalRef = this.modalService.open(ConfirmmodalComponent, { centered: true, size: 'sm' });
  modalRef.componentInstance.confirmMessage = 'Biztosan törlöd a fájlt?';

  modalRef.result.then(
    (result) => {
      if (result) {
        this.filesService.deleteFile(file.id).subscribe(
          (response: any) => {
            if (response && response.status === 'success') {
              this.messageService.setMessage('A fájl törlése sikeres!');
              this.getFiles();
            } else if (response && response.status === 'error') {
              this.messageService.setErrorMessage(response.message || 'Ismeretlen hiba történt.');
              this.getFiles();
            } else {
              this.messageService.setErrorMessage('Ismeretlen válasz érkezett a szervertől.');
            }
          },
          (error) => {
            console.log('Hiba:', error);
            this.messageService.setErrorMessage('Hiba történt a fájl továbbítás során.');
          }
        );
      }
    },
    (reason) => {
      console.log('Modal closed with reason:', reason);
    }
  );
}


    
  
}