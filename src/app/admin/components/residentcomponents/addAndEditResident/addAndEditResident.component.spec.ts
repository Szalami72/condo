import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddresidentComponent } from './AddAndEditResident.component';

describe('AddresidentComponent', () => {
  let component: AddresidentComponent;
  let fixture: ComponentFixture<AddresidentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddresidentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddresidentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
