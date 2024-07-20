import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-menulogoutconfirm',
  standalone: true,
  imports: [],
  templateUrl: './menulogoutconfirm.component.html',
  styleUrl: './menulogoutconfirm.component.css'
})
export class MenulogoutconfirmComponent {
 
  constructor(public activeModal: NgbActiveModal) {}
  confirm() {
    this.activeModal.close('confirmed');
  }

}
