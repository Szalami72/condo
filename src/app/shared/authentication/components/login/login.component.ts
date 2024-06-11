import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  providers: [CookieService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  email: string = '';
  password: string = '';
  stayedLoggedIn: boolean = false;

  constructor(private authService: AuthService, 
              private cookieService: CookieService,
              private router: Router) { }
  
              ngOnInit(): void {
                console.log('Bejelentkezés oldal betöltve.');
                if (this.cookieService.check('currentUser')) {
                  this.redirectToUrl();
                }
              }
              

  async login() {
    try {
      this.authService.getUserData(this.email, this.password).subscribe(response => {
        if (response.status === 'success') {
          console.log('Sikeres bejelentkezés:', response.user);

          // További teendők a sikeres bejelentkezés után
          this.setCookies(response.user);
          // Ellenőrizze az adminszintet és irányítsa át a megfelelő URL-re
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
    const adminLevel = this.getAdminLevelFromCookie();
    if (adminLevel < 2) {
      this.router.navigate(['/admin/home']);
    } else {
      this.router.navigate(['/user/home']);
    }
  }

  private getAdminLevelFromCookie(): number {
    const currentUser = this.cookieService.get('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      return userData.adminLevel;
    } else {
      return 0;
    }
  }
  
  private setCookies(user: any): void {
    const userData = { id: user.id, adminLevel: user.adminLevel, email: user.email, username: user.username };
    this.cookieService.set('currentUser', JSON.stringify(userData));
    console.log('Felhasználói adatok tárolva a sütiben.');
  }
}
