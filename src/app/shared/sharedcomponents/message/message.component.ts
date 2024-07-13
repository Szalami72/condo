import { Component } from '@angular/core';
import { MessageService } from '../../services/message.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-message',
  template: `
    <div *ngIf="messageService.message || messageService.errorMessage" class="alert alert-dismissible" [ngClass]="{
      'alert-success': messageService.message,
      'alert-danger': messageService.errorMessage
    }">
      <button type="button" class="btn-close" aria-label="Close" (click)="clearMessages()">
        <span aria-hidden="true"></span>
      </button>
      <span *ngIf="messageService.message">{{ messageService.message }}</span>
      <span *ngIf="messageService.errorMessage">{{ messageService.errorMessage }}</span>
    </div>
  `,
  styles: [],
  standalone: true,
  imports: [CommonModule],
})
export class MessageComponent {
  constructor(public messageService: MessageService) {}

  clearMessages(): void {
    this.messageService.clearMessages();
  }
}