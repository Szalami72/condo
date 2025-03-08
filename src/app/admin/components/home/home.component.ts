import { Component, OnInit } from '@angular/core';
import { MenuComponent } from '../menu/menu.component';
import { DatasService } from '../../services/datas.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MenuComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  condoName = '';
  downLoadLink = '../../../../assets/manual/admin_manual.pdf';
  constructor(private datasService: DatasService) { }

  ngOnInit(): void {
    this.getDatas();
  }

  getDatas(): void {
    this.datasService.getDatas().subscribe(datas => {
      this.condoName = datas[0].data;
    });
  }
}
