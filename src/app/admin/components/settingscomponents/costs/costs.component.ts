import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../../../shared/services/message.service';
import { CostsService } from '../../../services/costs.service';

@Component({
  selector: 'app-costs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './costs.component.html',
  styleUrls: ['./costs.component.css']
})
export class CostsComponent implements OnInit {

  commonCost: string | undefined;
  amountSmeter: number | undefined;
  amountFix: number | undefined;
  subDepSmeter: number | undefined;
  subDepFix: number | undefined;
  extraPayment: number | undefined;
  extraPaymentMode: string | undefined;
  extraPaymentTitle: string | undefined;
  calculate: string = '1';
  countAverage: string = '1';


  constructor(
    public messageService: MessageService, 
    private costsService: CostsService
  ) { }

  ngOnInit(): void {
    this.loadCosts();
  }

  loadCosts(): void {
    this.costsService.getCosts().subscribe({
      next: (response) => {

        if (response.status === 'success') {
          const data = response.data;
          this.commonCost = data.commonCost || undefined;
          this.amountSmeter = data.amountSmeter ? Number(data.amountSmeter) : undefined;
          this.amountFix = data.amountFix ? Number(data.amountFix) : undefined;
          this.subDepSmeter = data.subDepSmeter ? Number(data.subDepSmeter) : undefined;
          this.subDepFix = data.subDepFix ? Number(data.subDepFix) : undefined;
          this.extraPayment = data.extraPayment ? Number(data.extraPayment) : undefined;
          this.extraPaymentMode = data.extraPaymentMode || undefined;
          this.extraPaymentTitle = data.extraPaymentTitle || undefined;
          this.calculate = data.calculateCost || undefined;
          this.countAverage = data.countAverage || undefined;
        } else {
          this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
        }
      },
      error: (error) => {
        this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
      }
    });
  }

  saveCosts(): void { 
   
    const costsData = {
      commonCost: this.commonCost,
      amountSmeter: this.amountSmeter,
      amountFix: this.amountFix,
      subDepSmeter: this.subDepSmeter,
      subDepFix: this.subDepFix,
      extraPayment: this.extraPayment,
      extraPaymentMode: this.extraPaymentMode,
      extraPaymentTitle: this.extraPaymentTitle,
      calculate: this.calculate,
      countAverage: this.countAverage
    };

    this.costsService.saveCosts(costsData).subscribe({
      next: (response) => {
        this.messageService.setMessage('Az adatok mentése sikeres!');
      },
      error: (error) => {
        this.messageService.setErrorMessage('Hiba történt a mentés során. Próbáld meg később!');
      }
    });
  }

  deleteSelected(): void {
    this.commonCost = "";
    this.amountSmeter = 0;
    this.amountFix = 0;
    this.subDepSmeter = 0;
    this.subDepFix = 0;
  }
}
