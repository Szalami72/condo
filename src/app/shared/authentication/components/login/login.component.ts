import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  providers: [CookieService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email: string = '';
  password: string = '';
  stayedLoggedIn: boolean = false;

  constructor(private authService: AuthService, private cookieService: CookieService) { }

  async login() {
    
    try {
      this.authService.getUserData(this.email, this.password).subscribe(response => {
        if (response.status === 'success') {
          console.log('Sikeres bejelentkezés:', response.user);
  
          // További teendők a sikeres bejelentkezés után
          if (this.stayedLoggedIn) {
            // Sütik létrehozása és beállítása
            this.cookieService.set('currentUser', JSON.stringify(response.user));
            console.log('Felhasználói adatok tárolva a sütiben.');
          }
  
          // További műveletek a bejelentkezett felhasználóval
        } else {
          console.error('Sikertelen bejelentkezés:', response.message);
        }
      });
    } catch (error) {
      console.error('Hiba a bejelentkezés során:', error);
    }
  }
  
}
