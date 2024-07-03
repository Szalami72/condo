import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { from } from 'rxjs';
import { MessageService } from '../../../../shared/services/message.service';
import { ResidentsService } from '../../../services/residents.service';





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

  building: string | undefined;
  buildingOptions : any[] = [];
  newBuilding: string | undefined;

  floor: string | undefined;
  floorOptions : any[] = [];
  newFloor: string | undefined;

  door: string | undefined;
  doorOptions : any[] = [];
  newDoor: string | undefined;


  constructor(private activeModal: NgbActiveModal,
    private residentsService: ResidentsService,
    public messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadBuildings();
    this.loadFloors();
    this.loadDoors();
   }

   loadBuildings(): void {
    this.residentsService.getBuildings().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.buildingOptions = response.data;
        } else {
          this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
        }
      },
      error: (error) => {
        this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
      }
    });
  }

  loadFloors(): void {
    this.residentsService.getFloors().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.floorOptions = response.data;
        } else {
          this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
        }
      },
      error: (error) => {
        this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
      }
    });
  }

  loadDoors(): void {
    this.residentsService.getDoors().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.doorOptions = response.data;
        } else {
          this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
        }
      },
      error: (error) => {
        this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
      }
    });
  }

  closeModal() {
    this.activeModal.close();
  }

  onSave() {
    this.activeModal.close();
  }


}
