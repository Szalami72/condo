import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  message: string | null = null;
  errorMessage: string | null = null;

  constructor() { }

  setMessage(message: string): void {
    this.message = message;
    this.errorMessage = null;

    setTimeout(() => {
        this.message = null;
    }, 3000); 
}

  setErrorMessage(errorMessage: string): void {
    this.errorMessage = errorMessage;
    this.message = null;
  }

  clearMessages(): void {
    this.message = null;
    this.errorMessage = null;
  }
}
