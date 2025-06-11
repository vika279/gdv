import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CityComparisonComponent } from './city-comparison.component';

describe('CityComparisonComponent', () => {
  let component: CityComparisonComponent;
  let fixture: ComponentFixture<CityComparisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CityComparisonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CityComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
