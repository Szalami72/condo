import { Routes } from '@angular/router';
import { LoginComponent } from './shared/authentication/components/login/login.component';
import { ForgotPasswordComponent } from './shared/authentication/components/forgot-password/forgot-password.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
    { path: 'user', loadChildren: () => import('./user/user.module').then(m => m.UserModule) },
    { path: 'login', component: LoginComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent }
  ];

 

