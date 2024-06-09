import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email: string = '';
  password: string = '';
  stayedLogIn: boolean = false;

  constructor(private authService: AuthService) { }

  login() {
    this.authService.getUserData(this.email, this.password).subscribe(
      response => {
        if (response.status === 'success') {
          console.log('Login successful:', response.user);
          // További teendők a sikeres bejelentkezés után, pl. token mentése, átirányítás stb.
        } else {
          console.error('Login failed:', response.message);
        }
      },
      error => {
        console.error('Error:', error);
      }
    );
  }
}
