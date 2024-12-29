import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-previousmetersvalues',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './previousmetersvalues.component.html',
  styleUrl: './previousmetersvalues.component.css'
})
export class PreviousmetersvaluesComponent {

  @Input() prevValues: any;
  @Input() meterData: any;
  @Input() userName: any;
 

  constructor(public activeModal: NgbActiveModal) {}

  dismiss() {
    this.activeModal.dismiss('cancel');
  }

}
