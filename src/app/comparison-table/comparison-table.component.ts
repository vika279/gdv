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
  selector: 'app-comparison-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cards-container">
      <h3 class="cards-title">{{ getChartTitle() }}</h3>

      <!-- Bar Chart Section -->
      <div class="chart-section">
        <div class="chart-container">
          <div class="chart-item" *ngFor="let data of getChartData()">
            <div class="chart-label">
              {{ data.label }}
              <span *ngIf="data.label === 'Kitaplätze' || data.label === 'Grundschulplätze'"
                    [class]="'value-asterisk ' + (isMannheimDistrictSelected() ? 'mannheim-asterisk' : 'kaiserslautern-asterisk')">*</span>
            </div>
            <div class="chart-bars">
              <!-- Mannheim Bar -->
              <div class="bar-container mannheim-bar">
                <div class="bar-background">
                  <div
                    class="bar-fill mannheim-fill"
                    [style.width.%]="(data.mannheimValue / data.maxValue) * 100"
                  ></div>
                  <!-- Durchschnittslinie Mannheim -->
                  <div
                    *ngIf="isMannheimDistrictSelected()"
                    class="avg-line mannheim-avg-line"
                    [style.left.%]="(data.mannheimAvg / data.maxValue) * 100"
                    [title]="'Durchschnitt Mannheim: ' + data.mannheimAvg.toFixed(1)"
                  ></div>
                  <!-- Durchschnittslinie beide Städte -->
                  <div
                    *ngIf="isMannheimDistrictSelected()"
                    class="avg-line both-cities-avg-line"
                    [style.left.%]="(data.bothCitiesAvg / data.maxValue) * 100"
                    [title]="'Durchschnitt beide Städte: ' + data.bothCitiesAvg.toFixed(1)"
                  ></div>
                </div>
                <div class="values-container">
                  <div class="bar-value mannheim-value">{{ data.mannheimValue.toFixed(1) }}</div>
                  <ng-container *ngIf="isMannheimDistrictSelected()">
                    <div class="avg-value mannheim-avg-value">{{ data.mannheimAvg.toFixed(1) }}</div>
                    <div class="avg-value both-cities-avg-value">{{ data.bothCitiesAvg.toFixed(1) }}</div>
                  </ng-container>
                </div>
              </div>

              <!-- Kaiserslautern Bar -->
              <div class="bar-container kaiserslautern-bar">
                <div class="bar-background">
                  <div
                    class="bar-fill kaiserslautern-fill"
                    [style.width.%]="(data.kaiserslauternValue / data.maxValue) * 100"
                  ></div>
                  <!-- Durchschnittslinie Kaiserslautern -->
                  <div
                    *ngIf="isKaiserslauternDistrictSelected()"
                    class="avg-line kaiserslautern-avg-line"
                    [style.left.%]="(data.kaiserslauternAvg / data.maxValue) * 100"
                    [title]="'Durchschnitt Kaiserslautern: ' + data.kaiserslauternAvg.toFixed(1)"
                  ></div>
                  <!-- Durchschnittslinie beide Städte -->
                  <div
                    *ngIf="isKaiserslauternDistrictSelected()"
                    class="avg-line both-cities-avg-line"
                    [style.left.%]="(data.bothCitiesAvg / data.maxValue) * 100"
                    [title]="'Durchschnitt beide Städte: ' + data.bothCitiesAvg.toFixed(1)"
                  ></div>
                </div>
                <div class="values-container">
                  <div class="bar-value kaiserslautern-value">{{ data.kaiserslauternValue.toFixed(1) }}</div>
                  <ng-container *ngIf="isKaiserslauternDistrictSelected()">
                    <div class="avg-value kaiserslautern-avg-value">{{ data.kaiserslauternAvg.toFixed(1) }}</div>
                    <div class="avg-value both-cities-avg-value">{{ data.bothCitiesAvg.toFixed(1) }}</div>
                  </ng-container>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Legende - Durchschnittswerte nur wenn Stadtteile ausgewählt -->
        <div class="legend">
          <div class="legend-averages" *ngIf="hasDistrictsSelected()">
            <div class="legend-item" *ngIf="isMannheimDistrictSelected()">
              <div class="legend-color mannheim-avg-line"></div>
              <span>Durchschnitt Mannheim</span>
            </div>
            <div class="legend-item" *ngIf="isKaiserslauternDistrictSelected()">
              <div class="legend-color kaiserslautern-avg-line"></div>
              <span>Durchschnitt Kaiserslautern</span>
            </div>
            <div class="legend-item" *ngIf="hasDistrictsSelected()">
              <div class="legend-color both-cities-avg-line"></div>
              <span>Durchschnitt beide Städte</span>
            </div>
          </div>
          <div class="legend-note">
            * Die Werte wurden pro 100 Kinder berechnet
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .cards-container {
        border-radius: 12px;
        padding-left: 4rem;
        padding-top: 1rem;
      }

      .cards-title {
        margin: 0 0 20px 0;
        color: #333;
        font-size: 1.2rem;
        font-weight: 600;
      }

      .bar-label {
        font-size: 0.85rem;
        color: #666;
        font-weight: 500;
        text-align: center;
        margin-top: 5px;
      }

      .mannheim-value {
        color: #dc3545;
      }

      .kaiserslautern-value {
        color: #007bff;
      }

      /* Chart Styles */
      .chart-section {
        padding-top: 20px;
      }

      .chart-container {
        display: flex;
        flex-direction: column;
        gap: 30px; /* Größerer Abstand zwischen Kategorien */
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
        gap: 4px; /* Kleinerer Abstand zwischen den beiden Städten */
        max-width: 600px; /* Fixierte maximale Breite */
      }

      .bar-container {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .bar-background {
        position: relative;
        width: 25rem; /* Fixierte Breite für alle Balken */
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
        width: 3px;
        z-index: 2;
      }

      .mannheim-avg-line {
        background: #ff9800;
      }

      .kaiserslautern-avg-line {
        background: #1a237e;
      }

      .both-cities-avg-line {
        background: #757575;
      }

      .values-container {
        display: flex;
        gap: 10px;
        min-width: 150px;
      }

      .bar-value {
        min-width: 50px;
        text-align: left;
        font-size: 0.9rem;
        font-weight: 600;
      }

      .avg-value {
        min-width: 50px;
        text-align: left;
        font-size: 0.9rem;
        font-weight: 500;
      }

      .mannheim-avg-value {
        color: #ff9800;
      }

      .kaiserslautern-avg-value {
        color: #1a237e;
      }

      .both-cities-avg-value {
        color: #757575;
      }

      /* Legend */
      .legend {
        display: flex;
        flex-direction: column;
        margin-top: 2rem;
        border-radius: 8px;
      }

      .legend-averages {
        display: flex;
        gap: 15px;
        align-items: center;
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

      .legend-note {
        font-size: 0.85rem;
        color: #666;
        margin-top: 0.5rem;
        font-style: italic;
      }

      .value-asterisk {
        margin-left: 2px;
        font-size: 0.8rem;
      }



      @media (max-width: 968px) {
        .chart-item {
          flex-direction: column;
          align-items: stretch;
        }

        .chart-label {
          min-width: auto;
          text-align: center;
          margin-bottom: 10px;
        }

        .chart-bars {
          max-width: none;
        }

        .bar-background {
          width: 250px; /* Kleinere fixierte Breite für mobile Geräte */
        }

        .values-container {
          min-width: 120px;
        }

        .legend {
          flex-direction: column;
          gap: 10px;
        }
      }

      @media (max-width: 576px) {
        .bar-label {
          font-size: 0.8rem;
        }

        .bar-background {
          width: 200px; /* Noch kleinere Breite für sehr kleine Bildschirme */
        }

        .values-container {
          min-width: 100px;
          flex-direction: column;
        }

        .avg-value {
          font-size: 0.8rem;
        }
      }
    `,
  ],
})
export class ComparisonTableComponent implements OnInit, OnChanges {
  @Input() mannheimDistrict: District | null = null;
  @Input() kaiserslauternDistrict: District | null = null;

  // Default-Werte für Gesamtdaten
  private defaultMannheimDistrict: ExtendedDistrict = {
    name: 'Gesamt',
    city: 'Mannheim',
    kitas: 525.53,
    grundschulen: 613.12,
    kinderaerzte: 2.18,
    spielplaetze: 23.12,
    kinderanteil: 9.57,
    index: 2.62,
    coordinates: [49.4875, 8.466],
    Kitas_pro_100: 49,
    Grundschulen_pro_100: 88.71,
    Kinderärzte_pro_100: 0.13,
    Spielplätze_pro_100: 1.42,
    '%0-10': 9.57,
    Index_gesamt: 2.62,
    id: 'ma-gesamt',
    color: '',
    kitasIndex: 2.37,
    grundschulenIndex: 0,
    kinderaerzteIndex: 2.07,
    spielplaetzeIndex: 2.35,
    gesamt_kinder: 0,
    kinder_0_6: 1165.24,
    kinder_6_10: 681.41,
    kinder_0_10: 1846.65,
    kinderanteilIndex: 3.17,
    gesamt_Einwohner: 19332.18,
    avg_index: 2.51,
    kinder_grundschule: 88.71
  };

  private defaultKaiserslauternDistrict: ExtendedDistrict = {
    name: 'Gesamt',
    city: 'Kaiserslautern',
    kitas: 189.2,
    grundschulen: 168.72,
    kinderaerzte: 0.33,
    spielplaetze: 8.89,
    kinderanteil: 8.31,
    index: 2.47,
    coordinates: [49.4401, 7.7491],
    Kitas_pro_100: 69.57,
    Grundschulen_pro_100: 87.68,
    Kinderärzte_pro_100: 0.05,
    Spielplätze_pro_100: 2.23,
    '%0-10': 8.31,
    Index_gesamt: 2.47,
    id: 'kl-gesamt',
    color: '',
    kitasIndex: 2.66,
    grundschulenIndex: 0,
    kinderaerzteIndex: 1.43,
    spielplaetzeIndex: 2.53,
    gesamt_kinder: 0,
    kinder_0_6: 264.06,
    kinder_6_10: 191,
    kinder_0_10: 455.06,
    kinderanteilIndex: 2.51,
    gesamt_Einwohner: 5644.28,
    avg_index: 2.24,
    kinder_grundschule: 87.68
  };

  // Durchschnittswerte für die Städte (diese sollten aus Ihren Daten kommen)
  private mannheimAverages = {
    kinderanteil: 10.5,
    kitas: 8.2,
    spielplaetze: 5.8,
    grundschulen: 2.1,
    kinderaerzte: 0.8
  };

  private kaiserslauternAverages = {
    kinderanteil: 9.2,
    kitas: 6.5,
    spielplaetze: 4.3,
    grundschulen: 1.8,
    kinderaerzte: 0.6
  };

  ngOnInit() {
    console.log("##Mannheim",this.mannheimDistrict);
    console.log(this.displayMannheimDistrict);
        console.log(this.getMannheimMetrics());
  }

  ngOnChanges(changes: SimpleChanges) {}

  get displayMannheimDistrict(): ExtendedDistrict {
    // Wenn ein Stadtteil ausgewählt ist, verwende diesen, sonst Gesamtwerte
    return (
      (this.mannheimDistrict as ExtendedDistrict) ||
      this.defaultMannheimDistrict
    );
  }

  get displayKaiserslauternDistrict(): ExtendedDistrict {
    // Wenn ein Stadtteil ausgewählt ist, verwende diesen, sonst Gesamtwerte
    return (
      (this.kaiserslauternDistrict as ExtendedDistrict) ||
      this.defaultKaiserslauternDistrict
    );
  }

  // Titel für das Chart basierend auf Auswahl
  getChartTitle(): string {
    if (this.hasDistrictsSelected()) {
      return 'Vergleich mit Durchschnittswerten';
    }
    return 'Gesamtvergleich der Städte';
  }

  // Hilfsmethoden für die Stadtauswahl
  isMannheimDistrictSelected(): boolean {
    return this.mannheimDistrict !== null && this.mannheimDistrict.name !== 'Gesamt';
  }

  isKaiserslauternDistrictSelected(): boolean {
    return this.kaiserslauternDistrict !== null && this.kaiserslauternDistrict.name !== 'Gesamt';
  }

  areBothDistrictsSelected(): boolean {
    return this.isMannheimDistrictSelected() && this.isKaiserslauternDistrictSelected();
  }

  hasDistrictsSelected(): boolean {
    return this.isMannheimDistrictSelected() || this.isKaiserslauternDistrictSelected();
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
        return district.Kitas_pro_100 || (district.kitas / district.kinder_0_6) * 100 || 0;
      case 'grundschulen':
        return district.Grundschulen_pro_100 || district.kinder_grundschule || 0;
      case 'kinderaerzte':
        // Absolute Zahlen für Kinderärzte
        return district.kinderaerzte || 0;
      case 'spielplaetze':
        // Absolute Zahlen für Spielplätze
        return district.spielplaetze || 0;
      case 'kinderanteil':
        return district['%0-10'] || district.kinderanteil || 0;
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
        label: 'Kita',
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
        label: 'Grundschulen',
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
        pro100Field: '%0-10',
        useAbsolute: false
      },
      {
        field: 'kitas',
        label: 'Kitaplätze',
        pro100Field: 'Kitas_pro_100',
        useAbsolute: false
      },
      {
        field: 'spielplaetze',
        label: 'Spielplätze',
        pro100Field: 'spielplaetze',
        useAbsolute: true
      },
      {
        field: 'grundschulen',
        label: 'Grundschulplätze',
        pro100Field: 'Grundschulen_pro_100',
        useAbsolute: false
      },
      {
        field: 'kinderaerzte',
        label: 'Kinderärzte',
        pro100Field: 'kinderaerzte',
        useAbsolute: true
      }
    ];

    return metrics.map(metric => {
      const mannheimValue = this.getChartValue(mannheim, metric.field);
      const kaiserslauternValue = this.getChartValue(kaiserslautern, metric.field);

      // Durchschnittswerte nur berechnen wenn entsprechender Stadtteil ausgewählt ist
      let mannheimAvg = 0, kaiserslauternAvg = 0, bothCitiesAvg = 0;

      // Berechne die Durchschnittswerte für beide Städte
      if (metric.useAbsolute) {
        mannheimAvg = this.getChartValue(this.defaultMannheimDistrict, metric.field);
        kaiserslauternAvg = this.getChartValue(this.defaultKaiserslauternDistrict, metric.field);
      } else {
        mannheimAvg = this.defaultMannheimDistrict[metric.pro100Field as keyof ExtendedDistrict] as number;
        kaiserslauternAvg = this.defaultKaiserslauternDistrict[metric.pro100Field as keyof ExtendedDistrict] as number;
      }

      // Gesamtdurchschnitt immer berechnen wenn ein Stadtteil ausgewählt ist
      if (this.hasDistrictsSelected()) {
        bothCitiesAvg = (mannheimAvg + kaiserslauternAvg) / 2;
      }

      // maxValue berechnen basierend auf den vorhandenen Werten
      const valuesToConsider = [mannheimValue, kaiserslauternValue];
      if (this.isMannheimDistrictSelected()) {
        valuesToConsider.push(mannheimAvg);
        valuesToConsider.push(bothCitiesAvg);
      }
      if (this.isKaiserslauternDistrictSelected()) {
        valuesToConsider.push(kaiserslauternAvg);
        valuesToConsider.push(bothCitiesAvg);
      }

      const maxValue = Math.max(...valuesToConsider) * 1.1;

      return {
        label: metric.label,
        mannheimValue,
        kaiserslauternValue,
        mannheimAvg: this.isMannheimDistrictSelected() ? mannheimAvg : 0,
        kaiserslauternAvg: this.isKaiserslauternDistrictSelected() ? kaiserslauternAvg : 0,
        bothCitiesAvg,
        maxValue
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
