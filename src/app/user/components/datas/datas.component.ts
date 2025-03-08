import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';
import { MenuComponent } from '../menu/menu.component';
import { DatasService } from '../../../shared/services/datas.service';
import { CostsService } from '../../../shared/services/costs.service';
import { MenuService } from '../../services/menu.service';
import { ResidentsService } from '../../../shared/services/residents.service';
import { catchError, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-datas',
  standalone: true,
  imports: [MenuComponent, CommonModule],
  templateUrl: './datas.component.html',
  styleUrl: './datas.component.css'
})
export class DatasComponent implements OnInit {

  datas: any[] = [];
  costs: any[] = [];
  costsData = new Map<string, any>();  userData: any = {};
  costsArray: [string, any][] = [];
  userId: number = 0;

  constructor(public datasService: DatasService, 
    public costsService: CostsService,
    private sanitizer: DomSanitizer,
    public menuService: MenuService,
    private residentsService: ResidentsService) { }

    async ngOnInit() {
   
      this.userId = this.menuService.getCurrentUserDatas();
    
      if (this.userId) {
        this.inicialize();  
      } else {
        console.error("Nincs userId!");
      }
      await this.menuService.inicialize();
    }
    
    private inicialize(): void {
      forkJoin({
        datas: this.getDatas(),
        costs: this.getSettings(),
        userData: this.getUserDatas(this.userId) 
      }).subscribe({
        next: ({ datas, costs, userData }) => {
          console.log("Costs*:", costs[0].data);
          console.log("UserData*:", userData.data);
    
          this.datas = datas.length > 0 ? datas : [];
          this.costs = costs.length > 0 ? costs : [];
          this.userData = userData || {};
    
          if (this.costs.length > 0 && this.costs[0].data) {
            this.setCosts(this.costs[0].data, this.userData.data); 
          } else {
            console.error('A costs vagy a data hiányzik');
          }
        },
        error: (err) => {
          console.error("Hiba a forkJoin-ban:", err); 
        }
      });
    }
    
    getUserDatas(userId: number): Observable<any> {
      return this.residentsService.getResidentDatasById(userId).pipe(
        map(response => {
          return response;
        }),
        catchError(error => {
          console.error('Adatlekérési hiba:', error);
          return of({}); 
        })
      );
    }
    

  getDatas(): Observable<any> {
    return this.datasService.getDatas().pipe(
      map(response => response),
      catchError(error => {
        console.error('Adatlekérési hiba:', error);
        return of({}); 
      })
    );
  }

  getSettings(): Observable<any[]> {
    return this.costsService.getCosts().pipe(
      map(response => {
        return response ? [response] : []; 
      }),
      catchError(error => {
        console.error('Adatlekérési hiba:', error);
        return of([]); 
      })
    );
  }
  
  

  setCosts(costs: any, userData: any): void {
      
      // Közös költség fizetésének módja
      const costType = this.setCommonCostType(costs.commonCost);
      this.costsData.set('Közös költség fizetésének módja', costType);
  
      // Közös költség összege
      const commonCostValue = this.setCommonCostValue(userData, costs, costs.commonCost);
      this.costsData.set('Közös költség összege (Ft)', commonCostValue);
  
      // Albetéti díj
      if(userData.isMeters === 1) {
        const subDepMode = this.setCommonCostType(costs.commonCost);
        this.costsData.set('Albetéti díj fizetésének módja', subDepMode);
  
        const subDepValue = this.subDepValue(userData, costs, costs.commonCost);
        this.costsData.set('Albetéti díj, ha nincs vízóra (Ft)', subDepValue);
      }
  
      // Extra befizetés 
      if(costs.extraPayment > 0) {  
        const extraPayMentMode = this.setExraPayMentMode(costs);
        this.costsData.set('Extra befizetés módja', extraPayMentMode);
  
        const extraPayMent = this.setExtraPaymentValue(costs, userData);
        this.costsData.set('Extra befizetés összege (Ft)', extraPayMent);
  
        const extraPayMentTitle = costs.extraPaymentTitle;
        this.costsData.set('Extra befizetés indoka', extraPayMentTitle);
      }

      //víz és fűtésdíjak
      if(userData.isMeters === 1) {
        const metersCosts = this.setMetersCosts(userData, costs);
      }

      this.costsArray = Array.from(this.costsData.entries());
      console.log("CostsData:", this.costsData);
    }
  
  

  getSafeHtml(html: string): SafeHtml {
      return this.sanitizer.bypassSecurityTrustHtml(html);
    }

    setCommonCostValue(userData: any, costs: any, costType: string): any {
      if (costType === 'smeter') {
        return userData.typeOfSquareMeters * costs.amountSmeter;
      }else if (costType === 'perflat') {
        return userData.typeOfCommoncosts;
      }else if (costType === 'fix') {
        return costs.amountFix;
      }
      }

    setCommonCostType(costType: string): string {
      if (costType === 'perflat') {
        return 'lakásonként egyedi';
      }else if (costType === 'smeter') {
        return 'm<sup>2</sup> alapján'; 
      }else if (costType === 'fix') {
        return 'egységes'; 
      } 
      return 'Ismeretlen típus';
    }
    
    setExraPayMentMode(costs: any): string {
      if(costs.extraPaymentMode === 'smeter') {
        return 'Ft/m<sup>2</sup>';
      }else if (costs.extraPaymentMode === 'fix') {
        return 'egységes';
      }
      return 'Ismeretlen típus';
    }

    setExtraPaymentValue(costs: any, userData: any): any {
      if (costs.extraPaymentMode === 'smeter') {
        return userData.typeOfSquareMeters * parseFloat(costs.extraPayment);
      }else if (costs.extraPaymentMode === 'fix') {
        return costs.extraPayment;
      }
      return 'Ismeretlen típus';
    }

    subDepValue(userData: any, costs: any, costType: string): any {
      if (costType === 'smeter') {
        return userData.typeOfSquareMeters * parseFloat(costs.subDepSmeter);
      }else if (costType === 'perflat') {
        return userData.typeOfSubdeposits;
      }else if (costType === 'fix') {
        return costs.subDepFix;
      }
      }

    setMetersCosts(userData: any, costs: any): any {
      if(costs.cold1 > 0 || costs.cold2 > 0){
        this.costsData.set('Hidegvíz díj: (Ft/köbméter)', costs.coldAmount);
      }

      if(costs.hot1 > 0 || costs.hot2 > 0){
        this.costsData.set('Melegvíz díj: (Ft/köbméter)', costs.hotAmount);
      }

      if(costs.heating > 0){
        this.costsData.set('Hőmennyiség díj: (Ft/egység)', costs.heatingAmount);
      }

    }

    scrollToSection(sectionId: string) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
}
