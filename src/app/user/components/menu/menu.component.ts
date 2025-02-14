import { Component, OnInit,} from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ConfirmmodalComponent } from '../../../shared/sharedcomponents/confirmmodal/confirmmodal.component';
import { ScrollService } from '../../services/scroll.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  
  isHidden = false;
  hasNewBulletin: boolean = false;
  hasNewRecord: boolean = false;
  hasNewDatas: boolean = false;
  hasNewFile: boolean = false;

  constructor(
    private router: Router, 
    private notificationService: NotificationService, 
    private modalService: NgbModal,
    private scrollService: ScrollService
  ) {}


  ngOnInit(): void {
    this.scrollService.isScrollingDown$.subscribe(isScrollingDown => {
      this.isHidden = isScrollingDown;
    });

    this.notificationService.newBulletin$.subscribe(status => {
      this.hasNewBulletin = status;
    });

    // Feliratkozunk az enableRecord változóra
    this.notificationService.enableRecord$.subscribe(status => {
      this.hasNewRecord = status;
    });

    this.notificationService.newFile$.subscribe(status => {
      this.hasNewFile = status;
    });
  }

  
  logout(): void {
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
        //console.log('Hiba a modal bezárásakor:', reason);
      }
    );
  }
}
