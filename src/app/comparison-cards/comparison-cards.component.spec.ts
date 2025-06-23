import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparisonCardsComponent } from './comparison-cards.component';

describe('ComparisonCardsComponent', () => {
  let component: ComparisonCardsComponent;
  let fixture: ComponentFixture<ComparisonCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComparisonCardsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ComparisonCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
