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
  message: string = '';

constructor(private passwordService: ForgotPasswordService) { }
  async checkAndSendEmail() {
    try
    {
      this.passwordService.checkAndSendEmail(this.user).subscribe(response => {
        if (response.status === 'success') {
          this.errorMessage = '';
          this.message = 'Visszaállító link elküldve!\n Az email érvényessége 10 perc!';
          this.user = '';
        } else {
          this.errorMessage = "Nem regisztrált email cím!";
          this.message = '';
          this.user = '';
        }
      });
    } catch (error) {
      this.errorMessage = "Hiba az email ellenőrzés során!";
      this.user = '';
    }
   
  }
}
