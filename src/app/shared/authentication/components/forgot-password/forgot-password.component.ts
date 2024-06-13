import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ForgotPasswordService } from '../../../services/forgotpassword.service';


@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {

  user: string = '';
  errorMessage: string = '';

constructor(private passwordService: ForgotPasswordService) { }
  async checkAndSendEmail() {
    try
    {
      this.passwordService.checkAndSendEmail(this.user).subscribe(response => {
        if (response.status === 'success') {
          console.log('Létező felhasználó:', response.email);
          this.errorMessage = '';
        } else {
          console.error('Ilyen email cím nincs az adatbázisban!:', response.message);
          this.errorMessage = "Nem regisztrált email cím!";
        }
      });
    } catch (error) {
      this.errorMessage = "Hiba az email ellenőrzés során!";
      console.log(this.errorMessage);
    }
   
  }
}
