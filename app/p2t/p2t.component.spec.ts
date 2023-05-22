import { ComponentFixture, TestBed } from '@angular/core/testing';

import { P2tComponent } from './p2t.component';

describe('P2tComponent', () => {
  let component: P2tComponent;
  let fixture: ComponentFixture<P2tComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [P2tComponent]
    });
    fixture = TestBed.createComponent(P2tComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
