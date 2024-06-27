import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../../components/menu/menu.component';
import { FormsModule } from '@angular/forms';
import { RecdatesComponent } from '../settingscomponents/recdates/recdates.component';
import { MetersComponent } from '../settingscomponents/meters/meters.component';
import { CostsComponent } from '../settingscomponents/costs/costs.component';
import { DatasComponent } from './datas/datas.component';
import { InfosectionComponent } from '../settingscomponents/infosection/infosection.component';
import { MessageService } from '../../../shared/services/message.service';
import { DescriptionService } from '../../services/description.service';


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
            InfosectionComponent]
})
export class SettingsComponent {
  showInfo: boolean = false;

  constructor(public messageService: MessageService, public descriptionService: DescriptionService) { }

  toggleInfo(infoSection: InfosectionComponent) {
    infoSection.toggleInfo();
  }

  getRecDatesDescription(): string {
    return this.descriptionService.getRecDatesDescription();
  }

  getMetersDescription(): string {
    return this.descriptionService.getMetersDescription();
  }

  getCostsDescription(): string {
    return this.descriptionService.getCostsDescription();
  }

  getDatasDescription(): string {
    return this.descriptionService.getDatasDescription();
  }

}
