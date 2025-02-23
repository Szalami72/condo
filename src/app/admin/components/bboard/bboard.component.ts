import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { AngularEditorConfig } from '@kolkov/angular-editor';
import { AngularEditorModule } from '@kolkov/angular-editor';

import { MenuComponent } from '../menu/menu.component';
import { MessageComponent } from '../../../shared/sharedcomponents/message/message.component';
import { MessageService } from '../../../shared/services/message.service';
import { DescriptionService } from '../../services/description.service';
import { BboardService } from '../../services/bboard.service';
import { InfomodalComponent } from '../../../shared/sharedcomponents/infomodal/infomodal.component';
import { ConfirmmodalComponent } from '../../../shared/sharedcomponents/confirmmodal/confirmmodal.component';

@Component({
  selector: 'app-bboard',
  standalone: true,
  imports: [CommonModule, MenuComponent, AngularEditorModule, FormsModule, MessageComponent],
  templateUrl: './bboard.component.html',
  styleUrl: './bboard.component.css'
})
export class BboardComponent implements OnInit {

  bulletinBoards: any[] | undefined;
  editorContent: string = '';
  selectedBb: any = null;
  isEditing = false;
  isDelete = false;
  isFixed = false;

  editorConfig: AngularEditorConfig = {
    toolbarHiddenButtons: [
      [
      ],
      [
        'insertImage',
        'insertVideo',
        'insertHorizontalRule',
        'toggleEditorMode'
      ]
    ],
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '200px',
    placeholder: 'Ide írd a tartalmat...',
    translate: 'no',
    sanitize: false,
  };


  constructor(private sanitizer: DomSanitizer, 
    private bboardService: BboardService, 
    private messageService: MessageService,
    private descriptionService: DescriptionService,
    private modalService: NgbModal) {
    }

  ngOnInit(): void {
    this.messageService.setErrorMessage('Adatok betöltése...');
    this.getPreviousBbs();
  }


  getPreviousBbs() {
    this.bboardService.getPreviousBbs().subscribe({
      next: (response) => {
        this.bulletinBoards = response.data;
        console.log(this.bulletinBoards);
        this.messageService.setErrorMessage('');
      },
      error: (error) => {
        this.messageService.setErrorMessage('Hiba az adatok betöltése során. Próbáld meg később!');

        console.log(error);
      }
    })
  }

  saveOrUpdateBb() {
    const strippedContent = this.editorContent
        .replace(/<\/?[^>]+(>|$)/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();

    if(!this.editorContent || strippedContent === '') {
      this.messageService.setErrorMessage('Nem hoztál létre tartalmat!');
      return; 
    }
    
    this.bboardService.saveOrUpdateBb(this.editorContent, this.selectedBb ? this.selectedBb.id : null, this.isFixed).subscribe({
      next: (response) => {
        this.messageService.setMessage('A faliújság mentése sikeres!');
        this.getPreviousBbs();
        this.editorContent = '';
        this.isEditing = false;
        this.isDelete = false;
        this.selectedBb = null;
        this.isFixed = false;
        scrollTo(0, 0);
      },
      error: (error) => {
        console.log(error);
        this.messageService.setErrorMessage('Hiba az adatok mentése során. Próbáld meg később!');

      }
    })
  }

  editBb(bb: any) {
    this.selectedBb = bb;
    this.editorContent = this.selectedBb.content;
    this.isFixed = this.selectedBb.isFixed;
    this.isEditing = true;
    this.isDelete = true;
    scrollTo(0, 0);
  }

  deleteBb() {
    const modalRef = this.modalService.open(ConfirmmodalComponent, { centered: true, size: 'sm' });
    modalRef.componentInstance.confirmMessage = 'Biztosan törlöd a faliújságot?'; 

    modalRef.result.then( 
      (result) => {
        if(result) {
          this.bboardService.deleteBb(this.selectedBb.id).subscribe({
            next: (response) => {
              this.messageService.setMessage('A faliújság törlése sikeres!');
              this.getPreviousBbs();
              this.editorContent = '';
              this.isEditing = false;
              this.isDelete = false;
              this.selectedBb = null;
              this.isFixed = false;
            },
            error: (error) => {
              this.messageService.setErrorMessage('Hiba az adatok törlése során. Próbáld meg később!');

              console.log(error);
            }
          })
        } 
      },
      (reason) => {
        console.log(reason);
      } 
    );
      }

  cancelEdit() {
    this.isEditing = false;
    this.isDelete = false;
    this.selectedBb = null;
    this.editorContent = '';
    this.isFixed = false;
  }
  getBulletinBoardDescription(openModal: boolean = false): any | string {
  
    let message = '';
    message = this.descriptionService.getBulletinBoardDescription();
   
        const modalRef = this.modalService.open(InfomodalComponent, { centered: true });
        modalRef.componentInstance.infoMessage = message;
        return;
 
}

sanitizeHTML(html: string): SafeHtml {
  return this.sanitizer.bypassSecurityTrustHtml(html);
}

}


