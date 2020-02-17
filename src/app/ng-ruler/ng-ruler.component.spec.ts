import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgRulerComponent } from './ng-ruler.component';

describe('NgRulerComponent', () => {
  let component: NgRulerComponent;
  let fixture: ComponentFixture<NgRulerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgRulerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgRulerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
