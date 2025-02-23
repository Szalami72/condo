import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../../../shared/services/message.service';
import { DatasService } from '../../../services/datas.service';

@Component({
  selector: 'app-datas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './datas.component.html',
  styleUrl: './datas.component.css'
})
export class DatasComponent {

  condoDatas: { id: number, title: string, data: string, isEditable: boolean }[] = [];
  newTitle: string = '';
  newData: string = '';
  
  constructor(public messageService: MessageService, private datasService: DatasService) { }

  ngOnInit(): void {
    this.getDatas();
  }

  getDatas() {
    this.datasService.getDatas().subscribe(
      data => {
        this.condoDatas = data;
      },
      error => {
        this.messageService.setErrorMessage('Hiba történt az adatok letöltése során. Próbáld meg később!');
      }
    );
  }
  saveDatas(): void {
    if (this.newTitle) {
      const newDataEntry = {
        id: 0,
        title: this.newTitle,
        data: this.newData,
        isEditable: true
      };

      this.condoDatas.push(newDataEntry);
    }

    this.datasService.saveDatas(this.condoDatas).subscribe({
      next: (response) => {
        this.messageService.setMessage('Az adatok mentése sikeres.');
        this.newTitle = '';
        this.newData = '';
        this.getDatas();
      },
      error: (error) => {
        this.messageService.setErrorMessage('Hiba történt a mentés során. Próbáld meg később!');
      }
    });
  }
}
