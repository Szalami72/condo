import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MenulogoutconfirmComponent } from '../menulogoutconfirm/menulogoutconfirm.component';


@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  currentUser = this.getCurrentUserDatas();

  constructor(private router: Router,
    private modalService: NgbModal
  ) { 
  }
  logout() {
    const modalRef = this.modalService.open(MenulogoutconfirmComponent, { centered: true, size: 'sm' });
    modalRef.result.then(
      (result) => {
        if (result === 'confirmed') {
          console.log('Bejelentkezve: ', this.currentUser);
          localStorage.removeItem('currentUser');
          sessionStorage.removeItem('currentUser');
          this.router.navigate(['/login']);
  }
},
(reason) => {
  // A modal bezárásakor (pl. cancel vagy close)
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
