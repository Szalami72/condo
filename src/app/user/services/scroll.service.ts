import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  private lastScrollTop = 0;
  private scrollingDown = new BehaviorSubject<boolean>(false);

  // Observable a görgetési irány figyelésére
  isScrollingDown$ = this.scrollingDown.asObservable();

  constructor() {
    window.addEventListener('scroll', this.onScroll.bind(this));
  }

  private onScroll(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > this.lastScrollTop + 5) {
      // Lefelé görgetés (kisebb érzékenységi küszöb, pl. 5px)
      this.scrollingDown.next(true);
    } else if (scrollTop < this.lastScrollTop - 5) {
      // Felfelé görgetés (kisebb érzékenységi küszöb, pl. 5px)
      this.scrollingDown.next(false);
    }

    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // Ne menjünk negatív értékekbe
  }
}
