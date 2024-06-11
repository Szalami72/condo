import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './componenets/home/home.component';
import { UserGuard } from '../shared/authguards/userguard';

const routes: Routes = [
  {
    path: '',
    canActivate: [UserGuard],
    children: [
        { path: 'home', component: HomeComponent },
    ]
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
