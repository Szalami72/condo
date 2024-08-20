import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../../components/menu/menu.component';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RecdatesComponent } from '../settingscomponents/recdates/recdates.component';
import { MetersComponent } from '../settingscomponents/meters/meters.component';
import { CostsComponent } from '../settingscomponents/costs/costs.component';
import { DatasComponent } from '../settingscomponents/datas/datas.component';
import { MessageService } from '../../../shared/services/message.service';
import { DescriptionService } from '../../services/description.service';
import { MessageComponent } from "../../../shared/sharedcomponents/message/message.component";
import { InfomodalComponent } from '../../../shared/sharedcomponents/infomodal/infomodal.component';


@Component({
    selector: 'app-settings',
    standalone: true,
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.css',
    imports: [MenuComponent,
    CommonModule,
    FormsModule,
    RecdatesComponent,
    MetersComponent,
    CostsComponent,
    DatasComponent,
    MessageComponent,
    InfomodalComponent]
})
export class SettingsComponent {
  showInfo: boolean = false;
  
  constructor(public messageService: MessageService, 
    public descriptionService: DescriptionService,
    private modalService: NgbModal) { }


  

  getDescription(type: string, openModal: boolean = false): any | string {
    let message = '';

    switch(type) {
        case 'recDates':
            message = this.descriptionService.getRecDatesDescription();
            break;
        case 'meters':
            message = this.descriptionService.getMetersDescription();
            break;
        case 'costs':
            message = this.descriptionService.getCostsDescription();
            break;
        case 'datas':
            message = this.descriptionService.getDatasDescription();
            break;
        default:
            throw new Error('Invalid description type');
    }

    if (openModal) {
        const modalRef = this.modalService.open(InfomodalComponent, { centered: true });
        modalRef.componentInstance.infoMessage = message;
        return;
    }

    return message;
}

getRecDatesDescription(): void {
    this.getDescription('recDates', true);
}

getMetersDescription(): void {
    this.getDescription('meters', true);
}

getCostsDescription(): void {
    this.getDescription('costs', true);
}

getDatasDescription(): void {
    this.getDescription('datas', true);
}

}
