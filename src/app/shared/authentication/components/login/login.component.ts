import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  email: string = '';
  password: string = '';
  stayedLoggedIn: boolean = false;

  constructor(private authService: AuthService, 
              private router: Router) { }

  ngOnInit(): void {
    console.log('Bejelentkezés oldal betöltve.');
    if (this.getUserData()) {
      this.redirectToUrl();
    }
  }

  async login() {
    try {
      this.authService.getUserData(this.email, this.password).subscribe(response => {
        if (response.status === 'success') {
          console.log('Sikeres bejelentkezés:', response.user);
          this.setUserData(response.user);
          this.redirectToUrl();
        } else {
          console.error('Sikertelen bejelentkezés:', response.message);
        }
      });
    } catch (error) {
      console.error('Hiba a bejelentkezés során:', error);
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
    console.log('Felhasználói adatok tárolva.');
  }

  private getUserData(): any {
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
  }
}
