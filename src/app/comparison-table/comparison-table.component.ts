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

      <!-- Bar Chart Section - immer anzeigen -->
      <div class="chart-section">
        <div class="chart-container">
          <div class="chart-item" *ngFor="let data of getChartData()">
            <div class="chart-label">{{ data.label }}</div>
            <div class="chart-bars">
              <!-- Mannheim Bar -->
              <div class="bar-container mannheim-bar">
                <div class="bar-background">
                  <div
                    class="bar-fill mannheim-fill"
                    [style.width.%]="(data.mannheimValue / data.maxValue) * 100"
                  ></div>
                  <!-- Durchschnittslinie Mannheim - nur wenn Stadtteile ausgewählt -->
                  <div
                    *ngIf="hasDistrictsSelected()"
                    class="avg-line mannheim-avg-line"
                    [style.left.%]="(data.mannheimAvg / data.maxValue) * 100"
                    [title]="'Durchschnitt Mannheim: ' + data.mannheimAvg.toFixed(1)"
                  ></div>
                  <!-- Durchschnittslinie beide Städte - nur wenn Stadtteile ausgewählt -->
                  <div
                    *ngIf="hasDistrictsSelected()"
                    class="avg-line both-cities-avg-line"
                    [style.left.%]="(data.bothCitiesAvg / data.maxValue) * 100"
                    [title]="'Durchschnitt beide Städte: ' + data.bothCitiesAvg.toFixed(1)"
                  ></div>
                </div>
                <div class="bar-value mannheim-value">{{ data.mannheimValue.toFixed(1) }}</div>
              </div>

              <!-- Kaiserslautern Bar -->
              <div class="bar-container kaiserslautern-bar">
                <div class="bar-background">
                  <div
                    class="bar-fill kaiserslautern-fill"
                    [style.width.%]="(data.kaiserslauternValue / data.maxValue) * 100"
                  ></div>
                  <!-- Durchschnittslinie Kaiserslautern - nur wenn Stadtteile ausgewählt -->
                  <div
                    *ngIf="hasDistrictsSelected()"
                    class="avg-line kaiserslautern-avg-line"
                    [style.left.%]="(data.kaiserslauternAvg / data.maxValue) * 100"
                    [title]="'Durchschnitt Kaiserslautern: ' + data.kaiserslauternAvg.toFixed(1)"
                  ></div>
                  <!-- Durchschnittslinie beide Städte - nur wenn Stadtteile ausgewählt -->
                  <div
                    *ngIf="hasDistrictsSelected()"
                    class="avg-line both-cities-avg-line"
                    [style.left.%]="(data.bothCitiesAvg / data.maxValue) * 100"
                    [title]="'Durchschnitt beide Städte: ' + data.bothCitiesAvg.toFixed(1)"
                  ></div>
                </div>
                <div class="bar-value kaiserslautern-value">{{ data.kaiserslauternValue.toFixed(1) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Legende - nur anzeigen wenn Stadtteile ausgewählt sind -->
        <div class="legend" *ngIf="hasDistrictsSelected()">
          <div class="legend-item">
            <div class="legend-color mannheim-avg-line"></div>
            <span>Durchschnitt Mannheim</span>
          </div>
          <div class="legend-item">
            <div class="legend-color kaiserslautern-avg-line"></div>
            <span>Durchschnitt Kaiserslautern</span>
          </div>
          <div class="legend-item">
            <div class="legend-color both-cities-avg-line"></div>
            <span>Durchschnitt beide Städte</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .cards-container {
        width: 100%;
        background: white;
        border-radius: 12px;
        padding: 20px;
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
        min-width: 100px;
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
        width: 300px; /* Fixierte Breite für alle Balken */
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
        background:rgb(255, 113, 5);
      }

      .kaiserslautern-avg-line {
        background:rgb(5, 88, 255);
      }

      .both-cities-avg-line {
        background:rgb(147, 148, 148);

      }

      .bar-value {
        min-width: 50px;
        text-align: left;
        font-size: 0.9rem;
        font-weight: 600;
      }

      /* Legend */
      .legend {
        display: flex;
        justify-content: center;
        gap: 15px;
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
    kinderaerzte: 0.8
  };

  private kaiserslauternAverages = {
    kinderanteil: 9.2,
    kitas: 6.5,
    spielplaetze: 4.3,
    grundschulen: 1.8,
    kinderaerzte: 0.6
  };

  ngOnInit() {}

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

  // Prüft ob mindestens ein Stadtteil ausgewählt ist (nicht "Gesamt")
  hasDistrictsSelected(): boolean {
    return (
      (this.mannheimDistrict !== null && this.mannheimDistrict.name !== 'Gesamt') ||
      (this.kaiserslauternDistrict !== null && this.kaiserslauternDistrict.name !== 'Gesamt')
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
        return (
          district.Kitas_pro_100 ||
          (district.kitas / district.kinder_0_6) * 100 ||
          0
        );
      case 'grundschulen':
        return (
          district.Grundschulen_pro_100 || district.kinder_grundschule || 0
        );
      case 'kinderaerzte':
        return district['Kinderärzte_pro_100'] || district.kinderaerzte || 0;
      case 'spielplaetze':
        return district['Spielplätze_pro_100'] || district.spielplaetze || 0;
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
        mannheimAvg: this.mannheimAverages.kinderanteil,
        kaiserslauternAvg: this.kaiserslauternAverages.kinderanteil
      },
      {
        field: 'kitas',
        label: 'Kitas',
        mannheimAvg: this.mannheimAverages.kitas,
        kaiserslauternAvg: this.kaiserslauternAverages.kitas
      },
      {
        field: 'spielplaetze',
        label: 'Spielplätze',
        mannheimAvg: this.mannheimAverages.spielplaetze,
        kaiserslauternAvg: this.kaiserslauternAverages.spielplaetze
      },
      {
        field: 'grundschulen',
        label: 'Grundschulen',
        mannheimAvg: this.mannheimAverages.grundschulen,
        kaiserslauternAvg: this.kaiserslauternAverages.grundschulen
      },
      {
        field: 'kinderaerzte',
        label: 'Kinderärzte',
        mannheimAvg: this.mannheimAverages.kinderaerzte,
        kaiserslauternAvg: this.kaiserslauternAverages.kinderaerzte
      }
    ];

    return metrics.map(metric => {
      const mannheimValue = this.getChartValue(mannheim, metric.field);
      const kaiserslauternValue = this.getChartValue(kaiserslautern, metric.field);
      const bothCitiesAvg = (metric.mannheimAvg + metric.kaiserslauternAvg) / 2;

      // Wenn keine Stadtteile ausgewählt sind, berücksichtige keine Durchschnittswerte für maxValue
      let maxValue;
      if (this.hasDistrictsSelected()) {
        maxValue = Math.max(
          mannheimValue,
          kaiserslauternValue,
          metric.mannheimAvg,
          metric.kaiserslauternAvg,
          bothCitiesAvg
        ) * 1.1;
      } else {
        maxValue = Math.max(mannheimValue, kaiserslauternValue) * 1.1;
      }

      return {
        label: metric.label,
        mannheimValue,
        kaiserslauternValue,
        mannheimAvg: metric.mannheimAvg,
        kaiserslauternAvg: metric.kaiserslauternAvg,
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
