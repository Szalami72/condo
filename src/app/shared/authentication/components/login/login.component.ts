import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../../services/login.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  email: string = '';
  password: string = '';
  stayedLoggedIn: boolean = false;
  errorMessage: string = '';
  showCookieBanner: boolean = false;


  constructor(private loginService: LoginService, 
              private router: Router) { }

  ngOnInit(): void {
    this.showCookieBanner = !localStorage.getItem('cookieAccepted');

    if (this.getUserData()) {
      this.redirectToUrl();
    }
  }

  acceptCookies(): void {
    localStorage.setItem('cookieAccepted', 'true');
    this.showCookieBanner = false;
  }

  async login() {
    try {
      this.loginService.getUserData(this.email, this.password).subscribe(response => {
        if (response.status === 'success') {
          this.setUserData(response.user);
          this.redirectToUrl();
        } else {
          this.errorMessage = "Hibás bejelentkezési adatok!";
        }
      });
    } catch (error) {
      this.errorMessage = "Hiba a bejelentkezés során!";
    }
  }

  private redirectToUrl(): void {
    const adminLevel = this.getAdminLevelFromUserData();
    if (adminLevel < 2) {
      this.router.navigate(['/admin/home']);
    } else {
      this.router.navigate(['/user/home']);
    }
  }

  private getAdminLevelFromUserData(): number {
    const currentUser = this.getUserData();
    if (currentUser) {
      return currentUser.adminLevel;
    } else {
      return 0;
    }
  }
  
  private setUserData(user: any): void {
    const userData = { id: user.id, adminLevel: user.adminLevel, email: user.email, username: user.username };
    if (this.stayedLoggedIn) {
      localStorage.setItem('currentUser', JSON.stringify(userData));
    } else {
      sessionStorage.setItem('currentUser', JSON.stringify(userData));
    }
  }

  private getUserData(): any {
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
  }

  forgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}
