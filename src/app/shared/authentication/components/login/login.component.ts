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
    console.log(this.email, this.password, this.stayedLogIn);
    //this.authService.login(this.email, this.password);
  }
}
