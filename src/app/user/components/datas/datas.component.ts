import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MenuComponent } from '../menu/menu.component';
import { DatasService } from '../../../admin/services/datas.service'; 
import { CostsService } from '../../../admin/services/costs.service';
import { catchError, lastValueFrom, map, Observable, of } from 'rxjs';

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

  constructor(public datasService: DatasService, 
    public costsService: CostsService,
    private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.inicialize();
  }

  private inicialize(): void {
    this.getDatas().subscribe(response => {
      this.datas = response.length > 0 ? response : [];
    });

    this.getSettings().subscribe(response => {
      this.costs = response.length > 0 ? response : [];
    });
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
        console.log("Costs response:", response);
        return response ? [response] : []; 
      }),
      catchError(error => {
        console.error('Adatlekérési hiba:', error);
        return of([]); 
      })
    );
  }
  
  
  getSafeHtml(html: string): SafeHtml {
      return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}
