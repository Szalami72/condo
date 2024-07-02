import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';





@Component({
  selector: 'app-addresident',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [],
  templateUrl: './addresident.component.html',
  styleUrl: './addresident.component.css'
})
export class AddresidentComponent implements OnInit {

  @Input() commonCost: string | undefined;
  @Input() amountSmeter: number | undefined;
  @Input() amountFix: number | undefined;
  @Input() subDepSmeter: number | undefined;
  @Input() subDepFix: number | undefined;
  @Input() cold1: number | undefined;
  @Input() cold2: number | undefined;
  @Input() hot1: number | undefined;
  @Input() hot2: number | undefined;
  @Input() heating: number | undefined;

  errorMessage: string | undefined;

  name: string | undefined;
  email: string | undefined;
  phone: string | undefined;
  building: any[] = [];
  floor: any[] = [];
  door: any[] = [];


  constructor(private activeModal: NgbActiveModal) { }

  ngOnInit(): void { }

  closeModal() {
    this.activeModal.close();
  }

  onSave() {
    this.activeModal.close();
  }


}
