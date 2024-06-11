import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AdminGuard } from '../shared/authguards/adminguard';

const adminRoutes: Routes = [
  {
      path: '',
      canActivate: [AdminGuard],
      children: [
          { path: 'home', component: HomeComponent },
      ]
  },
];


@NgModule({
  imports: [RouterModule.forChild(adminRoutes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
