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
    this.cookieService.delete('currentUser');
    console.log('Felhasználói adatok törölve a sütiből.');
    this.router.navigate(['/login']);

  }
}
