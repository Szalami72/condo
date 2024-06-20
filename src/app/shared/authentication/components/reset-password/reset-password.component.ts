import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ForgotPasswordService } from '../../../services/forgotpassword.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';





@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  errorMessage: string = '';
  message: string = '';
  isValidToken: boolean = false;
  newPassword: string = '';
  confirmPassword: string = '';
  success: boolean = false;

  constructor(private route: ActivatedRoute,
     private forgotPasswordService: ForgotPasswordService,
     private router: Router) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (this.token) {
        this.checkToken(this.token);
      }else{
        this.router.navigate(['/login']);
      }
    });
  }
    async checkToken(token: string) {
      try
    {
      this.forgotPasswordService.checkToken(token).subscribe(response => {
        if (response.status === 'success') {
          this.isValidToken = true;
        } else {
          this.isValidToken = true;
        }
      });
    } catch (error) {
      console.error('Error checking token:', error);
    }
    }

    resetPassword() {
      this.message = '';
      this.errorMessage = '';

      if (this.newPassword.length < 8) {
        this.errorMessage = 'A jelszó nem elég hosszú!';
        this.newPassword = '';
        this.confirmPassword = '';
        return;
      }

      if (this.newPassword !== this.confirmPassword) {
        this.errorMessage = 'A jelszavak nem egyeznek!';
        this.newPassword = '';
        this.confirmPassword = '';
        return;
      }
     

      this.forgotPasswordService.saveNewPassword(this.token, this.newPassword).subscribe(response => {
        if (response.status === 'success') {
          this.message = 'A jelszó sikeresen mentve!';
          this.success = true;
          
        } else {          
          this.errorMessage = "Sikertelen jelszó mentés!";
        }
      });
    }

}
