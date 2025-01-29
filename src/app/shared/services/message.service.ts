import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  message: string | null = null;
  errorMessage: string | null = null;

  constructor() { }

  setMessage(message: string, autoClose: boolean = true): void {
    this.message = message;
    this.errorMessage = null;

    if (autoClose) {
        setTimeout(() => {
            this.message = null;
        }, 3000); // 3 másodperc után bezáródik
    }
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
