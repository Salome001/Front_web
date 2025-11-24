import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeEmployees } from './home-employees';

describe('HomeEmployees', () => {
  let component: HomeEmployees;
  let fixture: ComponentFixture<HomeEmployees>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeEmployees]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeEmployees);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
