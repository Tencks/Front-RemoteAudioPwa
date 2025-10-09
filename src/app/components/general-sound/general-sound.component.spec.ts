import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralSoundComponent } from './general-sound.component';

describe('GeneralSoundComponent', () => {
  let component: GeneralSoundComponent;
  let fixture: ComponentFixture<GeneralSoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralSoundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralSoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
