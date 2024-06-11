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

  userEmail: string = '';
  errorMessage: string = '';

constructor(private passwordService: ForgotPasswordService) { }
  sendEmail() {
    console.log(this.userEmail);
  }
}
