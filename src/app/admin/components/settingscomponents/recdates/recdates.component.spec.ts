import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecdatesComponent } from './recdates.component';

describe('RecdatesComponent', () => {
  let component: RecdatesComponent;
  let fixture: ComponentFixture<RecdatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecdatesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecdatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
