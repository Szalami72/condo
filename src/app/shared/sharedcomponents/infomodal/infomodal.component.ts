import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-infomodal',
  standalone: true,
  imports: [],
  templateUrl: './infomodal.component.html',
  styleUrl: './infomodal.component.css'
})
export class InfomodalComponent {
  @Input() infoMessage: string | undefined;

  constructor(public activeModal: NgbActiveModal) {}

  confirm() {
    this.activeModal.close('confirmed');
  }

  dismiss() {
    this.activeModal.dismiss('cancel');
  }
}

