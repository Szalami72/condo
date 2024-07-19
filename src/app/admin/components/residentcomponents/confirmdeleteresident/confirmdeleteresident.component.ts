import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-confirmdeleteresident',
  standalone: true,
  imports: [],
  templateUrl: './confirmdeleteresident.component.html',
  styleUrl: './confirmdeleteresident.component.css'
})
export class ConfirmdeleteresidentComponent {

  constructor(public activeModal: NgbActiveModal) {}

  confirm() {
    this.activeModal.close('confirmed');
  }
}
