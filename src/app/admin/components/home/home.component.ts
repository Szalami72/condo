import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private cookieService: CookieService, private router: Router) { }

  logout() : void {
    // Törli a felhasználói adatokat mind a localStorage-ból, mind a sessionStorage-ból
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    console.log('Felhasználói adatok törölve.');
    this.router.navigate(['/login']);
  }
  
}
