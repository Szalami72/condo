import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { MenuComponent } from '../menu/menu.component';
import { MessageComponent } from '../../../shared/sharedcomponents/message/message.component';
import { MessageService } from '../../../shared/services/message.service';
import { DescriptionService } from '../../services/description.service';
import { FilesService } from '../../services/files.service';

import { InfomodalComponent } from '../../../shared/sharedcomponents/infomodal/infomodal.component';
import { ConfirmmodalComponent } from '../../../shared/sharedcomponents/confirmmodal/confirmmodal.component';
import { HttpEventType, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-files',
  standalone: true,
  imports: [ CommonModule, FormsModule, MenuComponent, MessageComponent, InfomodalComponent, ConfirmmodalComponent ],
  templateUrl: './files.component.html',
  styleUrl: './files.component.css'
})
export class FilesComponent {

  selectedFile: File | null = null;
  description: string = '';




constructor(public messageService: MessageService, 
  public descriptionService: DescriptionService, 
  private modalService: NgbModal,
  private filesService: FilesService) { }
getFilesDescription(openModal: boolean = false): any | string {
  
  let message = '';
  message = this.descriptionService.getFilesDescription();
 
      const modalRef = this.modalService.open(InfomodalComponent, { centered: true });
      modalRef.componentInstance.infoMessage = message;
      return;

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
    return;
  }

  this.messageService.setErrorMessage('Feltöltés...');
  const formData = new FormData();
  formData.append('file', this.selectedFile, this.selectedFile.name);

  const descriptionToSend = this.description ? this.description : 'null';
  formData.append('description', descriptionToSend);

  this.filesService.saveFile(formData).subscribe(
    (response: any) => {
      console.log('Válasz:', response);
      
      if (response && response.status === 'success') {
        // Sikeres feltöltés
        this.messageService.setErrorMessage('');
        this.messageService.setMessage('A fájl feltöltése sikerült!');
        this.cancel();
      } else if (response && response.status === 'error') {
        // Hibakezelés
        this.messageService.setErrorMessage(response.message || 'Ismeretlen hiba történt.');
      } else {
        // Ha a válasz nem tartalmaz `status` mezőt
        this.messageService.setErrorMessage('Ismeretlen válasz érkezett a szervertől.');
      }
    },
    (error) => {
      console.log('Hiba:', error);
      this.messageService.setErrorMessage('Hiba történt a fájl feltöltése során.');
    }
  );
}

}

//TODO:
// kilistázni a fájlokat -> törlés és letöltés gombok és funkciók létrehozása