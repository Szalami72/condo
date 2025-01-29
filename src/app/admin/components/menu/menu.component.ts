import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ConfirmmodalComponent } from '../../../shared/sharedcomponents/confirmmodal/confirmmodal.component';


@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  currentUser = this.getCurrentUserDatas();
 
 
  constructor(private router: Router,
    private modalService: NgbModal,
  ) { 
    //console.log(this.currentUser);
  }
  logout() {
    const modalRef = this.modalService.open(ConfirmmodalComponent, { centered: true, size: 'sm' });
    modalRef.componentInstance.confirmMessage = 'Biztosan ki szeretne jelentkezni?'; 

      modalRef.result.then(
        (result) => {
          if (result === 'confirmed') {
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('currentUser');
            this.router.navigate(['/login']);
          }
        },
        (reason) => {
          console.log('Hiba a modal bezárásakor:', reason);
        }
      );
  }

  private getCurrentUserDatas() {
    let currentUserData = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (currentUserData) {
      return JSON.parse(currentUserData);
    }
  }
}
