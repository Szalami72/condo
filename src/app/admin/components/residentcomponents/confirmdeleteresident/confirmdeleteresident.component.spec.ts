import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmdeleteresidentComponent } from './confirmdeleteresident.component';

describe('ConfirmdeleteresidentComponent', () => {
  let component: ConfirmdeleteresidentComponent;
  let fixture: ComponentFixture<ConfirmdeleteresidentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmdeleteresidentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmdeleteresidentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
