import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAndEditResidentComponent } from './addAndEditResident.component';

describe('AddresidentComponent', () => {
  let component: AddAndEditResidentComponent;
  let fixture: ComponentFixture<AddAndEditResidentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAndEditResidentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAndEditResidentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
