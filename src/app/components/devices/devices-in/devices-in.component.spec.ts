import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicesInComponent } from './devices-in.component';

describe('DevicesInComponent', () => {
  let component: DevicesInComponent;
  let fixture: ComponentFixture<DevicesInComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevicesInComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevicesInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

