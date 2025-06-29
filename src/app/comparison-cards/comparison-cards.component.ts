import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { District } from '../app.component';

// Erweiterte District-Schnittstelle für die Chart-Daten
interface ExtendedDistrict extends District {
  Spielplätze_pro_100?: number;
  Kinderärzte_pro_100?: number;
  Grundschulen_pro_100?: number;
  Kitas_pro_100?: number;
  '%0-10'?: number;
  Index_gesamt?: number;
  Index_Spielplätze?: number;
  Index_Kinderärzte?: number;
  Index_Grundschule?: number;
  Index_Kitas?: number;
  'Index_%0-10'?: number;
  AVG?: number;
}

interface MetricCard {
  icon: string;
  label: string;
  value: number;
  unit: string;
}

interface ChartData {
  label: string;
  mannheimValue: number;
  kaiserslauternValue: number;
  mannheimAvg: number;
  kaiserslauternAvg: number;
  bothCitiesAvg: number;
  maxValue: number;
}

@Component({
  selector: 'app-comparison-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cards-container">
      <!-- <h3 class="cards-title">Anzahl pro 100 Kinder</h3> -->

      <div class="cities-grid">
        <!-- Mannheim Seite -->
        <div class="city-section mannheim-section">
          <div class="metrics-grid">
            <div
              class="metric-card mannheim-card"
              *ngFor="let metric of getMannheimMetrics()"
            >
              <div class="icon-container mannheim-icon">
                <div class="icon" [innerHTML]="metric.icon"></div>
              </div>
              <div class="metric-label">{{ metric.label }}</div>
              <div class="metric-value mannheim-value">
                {{ formatValue(metric.value, metric.unit) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Kaiserslautern Seite -->
        <div class="city-section kaiserslautern-section">
          <div class="metrics-grid">
            <div
              class="metric-card kaiserslautern-card"
              *ngFor="let metric of getKaiserslauternMetrics()"
            >
              <div class="icon-container kaiserslautern-icon">
                <div class="icon" [innerHTML]="metric.icon"></div>
              </div>
              <div class="metric-label">{{ metric.label }}</div>
              <div class="metric-value kaiserslautern-value">
                {{ formatValue(metric.value, metric.unit) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .cards-container {
        width: 100%;
        border-radius: 12px;
      }

      .cards-title {
        margin: 0 0 20px 0;
        color: #333;
        font-size: 1.2rem;
        font-weight: 600;
      }

      .cities-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;

        align-items: start;
      }

      .city-section {
        border-radius: 8px;
      }

      .mannheim-section {
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
         padding: 1rem;
      }

      .kaiserslautern-section {
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        padding: 1rem;
      }

      .metrics-grid {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
      }

      .metric-card {
        align-items: center;
        display: flex;
        flex-direction: column;
        padding: 12px;
      }

      .metric-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .icon-container {
        flex-shrink: 0;
      }

      .icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: 2px solid;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }

      .mannheim-icon .icon {
        border-color: #dc3545;
        color: #dc3545;
        background: rgba(220, 53, 69, 0.1);
      }

      .kaiserslautern-icon .icon {
        border-color: #007bff;
        color: #007bff;
        background: rgba(0, 123, 255, 0.1);
      }

      .metric-label {
        flex: 1;
        font-size: 0.95rem;
        color: #666;
        font-weight: 500;
        text-align: center;
      }

      .metric-value {
        font-size: 1.3rem;
        font-weight: bold;
        padding: 8px 15px;
        border-radius: 20px;
        min-width: 60px;
        text-align: center;
      }

      .mannheim-value {
        color: #dc3545;
      }

      .kaiserslautern-value {
        color: #007bff;
      }

      /* Chart Styles */
      .chart-section {
        border-top: 1px solid #e9ecef;
        padding-top: 20px;
      }

      .chart-title {
        margin: 0 0 20px 0;
        color: #333;
        font-size: 1.1rem;
        font-weight: 600;
      }

      .chart-container {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .chart-item {
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .chart-label {
        min-width: 120px;
        font-size: 0.9rem;
        font-weight: 500;
        color: #666;
      }

      .chart-bars {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .bar-container {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .bar-background {
        position: relative;
        flex: 1;
        height: 25px;
        background: #f1f3f4;
        border-radius: 12px;
        overflow: hidden;
      }

      .bar-fill {
        height: 100%;
        border-radius: 12px;
        transition: width 0.3s ease;
      }

      .mannheim-fill {
        background: linear-gradient(90deg, #dc3545, #ff6b7a);
      }

      .kaiserslautern-fill {
        background: linear-gradient(90deg, #007bff, #4dabf7);
      }

      .avg-line {
        position: absolute;
        top: 0;
        height: 100%;
        width: 2px;
        z-index: 2;
      }

      .mannheim-avg-line {
        background: #8b0000;
        box-shadow: 0 0 4px rgba(139, 0, 0, 0.5);
      }

      .kaiserslautern-avg-line {
        background: #003d82;
        box-shadow: 0 0 4px rgba(0, 61, 130, 0.5);
      }

      .both-cities-avg-line {
        background: #666;
        box-shadow: 0 0 4px rgba(102, 102, 102, 0.5);
      }

      .bar-value {
        min-width: 50px;
        text-align: right;
        font-size: 0.9rem;
        font-weight: 600;
      }

      /* Legend */
      .legend {
        display: flex;
        justify-content: center;
        gap: 30px;
        margin-top: 20px;
        padding: 15px;
        border-radius: 8px;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.85rem;
        color: #666;
      }

      .legend-color {
        width: 20px;
        height: 3px;
        border-radius: 2px;
      }

      @media (max-width: 968px) {
        .cities-grid {
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .chart-item {
          flex-direction: column;
          align-items: stretch;
        }

        .chart-label {
          min-width: auto;
          text-align: center;
          margin-bottom: 10px;
        }

        .legend {
          flex-direction: column;
          gap: 10px;
        }
      }

      @media (max-width: 576px) {
        .metric-card {
          flex-direction: column;
          text-align: center;
          gap: 10px;
        }

        .metric-label {
          font-size: 0.9rem;
        }

        .metric-value {
          font-size: 1.1rem;
        }
      }
    `,
  ],
})
export class ComparisonCardsComponent implements OnInit, OnChanges {
  @Input() mannheimDistrict: District | null = null;
  @Input() kaiserslauternDistrict: District | null = null;

  // Default-Werte für Gesamtdaten
  private defaultMannheimDistrict: ExtendedDistrict = {
    name: 'Gesamt',
    kitas: 23,
    grundschulen: 1,
    kinderaerzte: 2,
    spielplaetze: 2,
    kinderanteil: 9.6,
    index: 2.1,
    coordinates: [49.4875, 8.466],
    Kitas_pro_100: 9,
    Grundschulen_pro_100: 6,
    Kinderärzte_pro_100: 1,
    Spielplätze_pro_100: 5,
    '%0-10': 7,
    Index_gesamt: 4,
    id: '',
    city: '',
    color: '',
    kitasIndex: 0,
    grundschulenIndex: 0,
    kinderaerzteIndex: 0,
    spielplaetzeIndex: 0,
    gesamt_kinder: 0,
    kinder_0_6: 0,
    kinder_6_10: 0,
    kinder_0_10: 0,
    kinderanteilIndex: 0,
    gesamt_Einwohner: 0,
    avg_index: 0,
    kinder_grundschule: 0,
  };

  private defaultKaiserslauternDistrict: ExtendedDistrict = {
    name: 'Gesamt',
    kitas: 9,
    grundschulen: 2,
    kinderaerzte: 3,
    spielplaetze: 0,
    kinderanteil: 8.3,
    index: 1.4,
    coordinates: [49.4401, 7.7491],
    Kitas_pro_100: 7,
    Grundschulen_pro_100: 8,
    Kinderärzte_pro_100: 2,
    Spielplätze_pro_100: 6,
    '%0-10': 5,
    Index_gesamt: 3,
    id: '',
    city: '',
    color: '',
    kitasIndex: 0,
    grundschulenIndex: 0,
    kinderaerzteIndex: 0,
    spielplaetzeIndex: 0,
    gesamt_kinder: 0,
    kinder_0_6: 0,
    kinder_6_10: 0,
    kinder_0_10: 0,
    kinderanteilIndex: 0,
    gesamt_Einwohner: 0,
    avg_index: 0,
    kinder_grundschule: 0,
  };

  // Durchschnittswerte für die Städte (diese sollten aus Ihren Daten kommen)
  private mannheimAverages = {
    kinderanteil: 10.5,
    kitas: 8.2,
    spielplaetze: 5.8,
    grundschulen: 2.1,
    kinderaerzte: 0.8,
  };

  private kaiserslauternAverages = {
    kinderanteil: 9.2,
    kitas: 6.5,
    spielplaetze: 4.3,
    grundschulen: 1.8,
    kinderaerzte: 0.6,
  };

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {}

  get displayMannheimDistrict(): ExtendedDistrict {
    return (
      (this.mannheimDistrict as ExtendedDistrict) ||
      this.defaultMannheimDistrict
    );
  }

  get displayKaiserslauternDistrict(): ExtendedDistrict {
    return (
      (this.kaiserslauternDistrict as ExtendedDistrict) ||
      this.defaultKaiserslauternDistrict
    );
  }

  isGesamtSelected(): boolean {
    return (
      this.displayMannheimDistrict.name === 'Gesamt' ||
      this.displayKaiserslauternDistrict.name === 'Gesamt'
    );
  }

  getMannheimScore(): number {
    const district = this.displayMannheimDistrict;
    return Math.round(district.Index_gesamt || district.index);
  }

  getKaiserslauternScore(): number {
    const district = this.displayKaiserslauternDistrict;
    return Math.round(district.Index_gesamt || district.index);
  }

  private getChartValue(district: ExtendedDistrict, field: string): number {
    switch (field) {
      case 'kitas':
        return parseInt(district.kitas.toString(), 10) || 0;
      case 'grundschulen':
        return Math.round(district.grundschulen) || 0;
      case 'kinderaerzte':
        return Math.round(district.kinderaerzte) || 0;
      case 'spielplaetze':
        return Math.round(district.spielplaetze) || 0;
      case 'kinderanteil':
        return Math.round(district.kinderanteil) || 0;
      default:
        return 0;
    }
  }

  getMannheimMetrics(): MetricCard[] {
    const mannheim = this.displayMannheimDistrict;

    return [
      {
        icon: '👨‍👩‍👧‍👦',
        label: 'Kinderanteil',
        value: this.getChartValue(mannheim, 'kinderanteil'),
        unit: '%',
      },
      {
        icon: '🏫',
        label: 'Kitaplätze',
        value: this.getChartValue(mannheim, 'kitas'),
        unit: '',
      },
      {
        icon: '🎪',
        label: 'Spielplätze',
        value: this.getChartValue(mannheim, 'spielplaetze'),
        unit: '',
      },
      {
        icon: '🏫',
        label: 'Grundschulplätze',
        value: this.getChartValue(mannheim, 'grundschulen'),
        unit: '',
      },
      {
        icon: '👨‍⚕️',
        label: 'Kinderärzte',
        value: this.getChartValue(mannheim, 'kinderaerzte'),
        unit: '',
      },
    ];
  }

  getKaiserslauternMetrics(): MetricCard[] {
    const kaiserslautern = this.displayKaiserslauternDistrict;

    return [
      {
        icon: '👨‍👩‍👧‍👦',
        label: 'Kinderanteil',
        value: this.getChartValue(kaiserslautern, 'kinderanteil'),
        unit: '%',
      },
      {
        icon: '🏫',
        label: 'Kita',
        value: this.getChartValue(kaiserslautern, 'kitas'),
        unit: '',
      },
      {
        icon: '🎪',
        label: 'Spielplätze',
        value: this.getChartValue(kaiserslautern, 'spielplaetze'),
        unit: '',
      },
      {
        icon: '🏫',
        label: 'Grundschulen',
        value: this.getChartValue(kaiserslautern, 'grundschulen'),
        unit: '',
      },
      {
        icon: '👨‍⚕️',
        label: 'Kinderärzte',
        value: this.getChartValue(kaiserslautern, 'kinderaerzte'),
        unit: '',
      },
    ];
  }

  getChartData(): ChartData[] {
    const mannheim = this.displayMannheimDistrict;
    const kaiserslautern = this.displayKaiserslauternDistrict;

    const metrics = [
      {
        field: 'kinderanteil',
        label: 'Kinderanteil',
        mannheimAvg: this.mannheimAverages.kinderanteil,
        kaiserslauternAvg: this.kaiserslauternAverages.kinderanteil,
      },
      {
        field: 'kitas',
        label: 'Kitas',
        mannheimAvg: this.mannheimAverages.kitas,
        kaiserslauternAvg: this.kaiserslauternAverages.kitas,
      },
      {
        field: 'spielplaetze',
        label: 'Spielplätze',
        mannheimAvg: this.mannheimAverages.spielplaetze,
        kaiserslauternAvg: this.kaiserslauternAverages.spielplaetze,
      },
      {
        field: 'grundschulen',
        label: 'Grundschulen',
        mannheimAvg: this.mannheimAverages.grundschulen,
        kaiserslauternAvg: this.kaiserslauternAverages.grundschulen,
      },
      {
        field: 'kinderaerzte',
        label: 'Kinderärzte',
        mannheimAvg: this.mannheimAverages.kinderaerzte,
        kaiserslauternAvg: this.kaiserslauternAverages.kinderaerzte,
      },
    ];

    return metrics.map((metric) => {
      const mannheimValue = this.getChartValue(mannheim, metric.field);
      const kaiserslauternValue = this.getChartValue(
        kaiserslautern,
        metric.field
      );
      const bothCitiesAvg = (metric.mannheimAvg + metric.kaiserslauternAvg) / 2;

      const maxValue =
        Math.max(
          mannheimValue,
          kaiserslauternValue,
          metric.mannheimAvg,
          metric.kaiserslauternAvg,
          bothCitiesAvg
        ) * 1.1; // 10% Puffer für bessere Darstellung

      return {
        label: metric.label,
        mannheimValue,
        kaiserslauternValue,
        mannheimAvg: metric.mannheimAvg,
        kaiserslauternAvg: metric.kaiserslauternAvg,
        bothCitiesAvg,
        maxValue,
      };
    });
  }

  formatValue(value: number, unit: string): string {
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    }
    return value.toFixed(1);
  }
}
