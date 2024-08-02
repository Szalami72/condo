import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousmetersvaluesComponent } from './previousmetersvalues.component';

describe('PreviousmetersvaluesComponent', () => {
  let component: PreviousmetersvaluesComponent;
  let fixture: ComponentFixture<PreviousmetersvaluesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviousmetersvaluesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviousmetersvaluesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
