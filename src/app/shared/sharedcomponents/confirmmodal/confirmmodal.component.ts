import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmmodal',
  standalone: true,
  templateUrl: './confirmmodal.component.html',
  styleUrls: ['./confirmmodal.component.css']
})
export class ConfirmmodalComponent {
  @Input() confirmMessage: string | undefined;

  constructor(public activeModal: NgbActiveModal) {}

  confirm() {
    this.activeModal.close('confirmed');
  }

  dismiss() {
    this.activeModal.dismiss('cancel');
  }
}
