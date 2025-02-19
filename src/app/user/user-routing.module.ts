import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { UserGuard } from '../shared/authguards/userguard';
import { RecordComponent } from './components/record/record.component';
import { DatasComponent } from './components/datas/datas.component';
import { FilesComponent } from './components/files/files.component';
import { ProfileComponent } from './components/profile/profile.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [UserGuard],
    children: [
        { path: 'home', component: HomeComponent },
        { path: 'record', component: RecordComponent },
        { path: 'datas', component: DatasComponent },
        { path: 'files', component: FilesComponent },
        { path: 'profile', component: ProfileComponent },
        { path: '**', component: HomeComponent }
    ]
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
