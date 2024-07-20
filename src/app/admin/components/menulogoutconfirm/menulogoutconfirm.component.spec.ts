import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenulogoutconfirmComponent } from './menulogoutconfirm.component';

describe('MenulogoutconfirmComponent', () => {
  let component: MenulogoutconfirmComponent;
  let fixture: ComponentFixture<MenulogoutconfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenulogoutconfirmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenulogoutconfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
