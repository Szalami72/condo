import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AdminGuard } from '../shared/authguards/adminguard';
import { SettingsComponent } from './components/settings/settings.component';
import { PagenotfoundComponent } from '../shared/authentication/components/pagenotfound/pagenotfound.component';

const adminRoutes: Routes = [
  {
      path: '',
      canActivate: [AdminGuard],
      children: [
          { path: 'home', component: HomeComponent },
          { path: 'settings', component: SettingsComponent },

          { path: '**', component: PagenotfoundComponent }


      ]
  },
];


@NgModule({
  imports: [RouterModule.forChild(adminRoutes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
