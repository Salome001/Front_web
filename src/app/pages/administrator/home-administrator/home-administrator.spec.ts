import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeAdministrator } from './home-administrator';

describe('HomeAdministrator', () => {
  let component: HomeAdministrator;
  let fixture: ComponentFixture<HomeAdministrator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeAdministrator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeAdministrator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
