import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './authentication/components/login/login.component';

const sharedRoutes: Routes = [
    { path: 'login', component: LoginComponent },
    
];

@NgModule({
    imports: [RouterModule.forRoot(sharedRoutes)],
    exports: [RouterModule],


})
export class SharedRoutingModule { }