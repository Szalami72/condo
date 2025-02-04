import { Component, OnInit } from '@angular/core';
import { CostsService } from '../../../admin/services/costs.service';
import { MenuComponent } from '../menu/menu.component';
import { MessageService } from '../../../shared/services/message.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-record',
  standalone: true,
  imports: [MenuComponent],
  templateUrl: './record.component.html',
  styleUrl: './record.component.css'
})


export class RecordComponent implements OnInit {
  settings: any[] = [];

  constructor(private costsService: CostsService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.getSettings();
  }

  private getSettings(): void {
    this.costsService.getCosts().subscribe({
      next: (response) => {

        if (response.status === 'success') {
          const data = response.data;
          console.log('data', data);
          this.settings = data.settings || [];
        } else {
          this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
        }
      },
      error: (error) => {
        this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
      }
    });
    }

}
