import { Component} from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MenuComponent } from '../menu/menu.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MenuComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {



  constructor(private cookieService: CookieService, private router: Router) { }

  logout(): void {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    console.log('Felhasználói adatok törölve.');
    this.router.navigate(['/login']);
  }
}
