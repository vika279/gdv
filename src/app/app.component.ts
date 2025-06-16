import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './map/map.component';
import { RadarChartComponent } from './radar-chart/radar-chart.component';
import { ComparisonTableComponent } from './comparison-table/comparison-table.component';


export interface District {
  id: string;
  name: string;
  city: string;
  coordinates: [number, number];
  kitas: number;
  grundschulen: number;
  kinderaerzte: number;
  spielplaetze: number;
  kinderanteil: number; // Prozent 0-10 Jahre
  index: number; // 1-5 Skala
  color: string;
}

export interface Facility {
  id: string;
  name: string;
  type: 'kita' | 'grundschule' | 'kinderarzt' | 'spielplatz';
  coordinates: [number, number];
  district: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MapComponent, RadarChartComponent, ComparisonTableComponent],
  template: `
    <div class="app-container">
      <header class="header">
        <!-- <h1>Kinderfreundlichkeits-Vergleich: Mannheim vs. Kaiserslautern</h1>
        <p class="subtitle">Interaktive Analyse kindgerechter Infrastruktur für Kinder im Alter von 0-10 Jahren</p> -->
      </header>

      <div class="main-content">
        <!-- Karten-Vergleich -->
        <div class="maps-section">
          <h2>Stadtvergleich</h2>
          <p class="info">Klicken Sie je einen Stadtteil in beiden Städten an, um sie zu vergleichen.</p>

          <app-map
            [districts]="districts"
            [facilities]="facilities"
            (districtSelected)="onDistrictSelected($event)">
          </app-map>
        </div>

        <!-- Auswahlstatus -->
        <div class="selection-status" *ngIf="selectedMannheim || selectedKaiserslautern">
          <div class="selected-districts">
            <div class="selected-district mannheim" *ngIf="selectedMannheim">
              <strong>Mannheim:</strong> {{ selectedMannheim.name }}
              <span class="index">Index: {{ selectedMannheim.index }}/5</span>
            </div>
            <div class="selected-district kaiserslautern" *ngIf="selectedKaiserslautern">
              <strong>Kaiserslautern:</strong> {{ selectedKaiserslautern.name }}
              <span class="index">Index: {{ selectedKaiserslautern.index }}/5</span>
            </div>
          </div>
        </div>

        <!-- Vergleichsanalyse -->
        <div class="comparison-section" *ngIf="selectedMannheim && selectedKaiserslautern">
          <h2>Detailvergleich</h2>

          <div class="comparison-content">
            <!-- Radar Chart -->
            <div class="chart-container">
              <h3>Indikator-Vergleich</h3>
              <app-radar-chart
                [mannheimDistrict]="selectedMannheim"
                [kaiserslauternDistrict]="selectedKaiserslautern">
              </app-radar-chart>
            </div>

            <!-- Vergleichstabelle -->
            <div class="table-container">
              <h3>Absolute Werte</h3>
              <app-comparison-table
                [mannheimDistrict]="selectedMannheim"
                [kaiserslauternDistrict]="selectedKaiserslautern">
              </app-comparison-table>
            </div>
          </div>
        </div>

        <!--
        <div class="legend">
          <h3>Index-Skala</h3>
          <div class="legend-items">
            <div class="legend-item" style="background-color: #d73027;">
              <span class="legend-value">1</span>
              <span class="legend-label">Sehr niedrig</span>
            </div>
            <div class="legend-item" style="background-color: #f46d43;">
              <span class="legend-value">2</span>
              <span class="legend-label">Niedrig</span>
            </div>
            <div class="legend-item" style="background-color: #fdae61;">
              <span class="legend-value">3</span>
              <span class="legend-label">Mittel</span>
            </div>
            <div class="legend-item" style="background-color: #abd9e9;">
              <span class="legend-value">4</span>
              <span class="legend-label">Hoch</span>
            </div>
            <div class="legend-item" style="background-color: #2166ac;">
              <span class="legend-value">5</span>
              <span class="legend-label">Sehr hoch</span>
            </div>
          </div>
        </div> Legende -->
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      // min-height: 100vh;
      // background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      // padding: 20px;
      // font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .header {
      text-align: center;
      color: white;
      margin-bottom: 30px;
    }

    .header h1 {
      margin: 0;
      font-size: 2.5rem;
      font-weight: 300;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .subtitle {
      margin: 10px 0 0 0;
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .main-content {
      // max-width: 1400px;
      margin: 0 auto;
    }

    .maps-section {
      background: white;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 25px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }

    .maps-section h2 {
      margin: 0 0 10px 0;
      color: #333;
      font-weight: 500;
    }

    .info {
      color: #666;
      margin: 0 0 20px 0;
      font-style: italic;
    }

    .selection-status {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 25px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .selected-districts {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .selected-district {
      padding: 12px 18px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      flex: 1;
      min-width: 200px;
    }

    .selected-district.mannheim {
      background: linear-gradient(135deg, #667eea, #764ba2);
    }

    .selected-district.kaiserslautern {
      background: linear-gradient(135deg, #f093fb, #f5576c);
    }

    .index {
      display: block;
      font-size: 0.9rem;
      margin-top: 5px;
      opacity: 0.9;
    }

    .comparison-section {
      background: white;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 25px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }

    .comparison-section h2 {
      margin: 0 0 20px 0;
      color: #333;
      font-weight: 500;
    }

    .comparison-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }

    @media (max-width: 1024px) {
      .comparison-content {
        grid-template-columns: 1fr;
      }
    }

    .chart-container, .table-container {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
    }

    .chart-container h3, .table-container h3 {
      margin: 0 0 15px 0;
      color: #444;
      font-weight: 500;
    }

    .legend {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .legend h3 {
      margin: 0 0 15px 0;
      color: #333;
      font-weight: 500;
    }

    .legend-items {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 6px;
      color: white;
      font-weight: 500;
      min-width: 100px;
    }

    .legend-value {
      font-weight: bold;
    }

    .legend-label {
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .app-container {
        padding: 10px;
      }

      .header h1 {
        font-size: 2rem;
      }

      .selected-districts {
        flex-direction: column;
      }

      .legend-items {
        justify-content: center;
      }
    }
  `]
})
export class AppComponent {
  selectedMannheim: District | null = null;
  selectedKaiserslautern: District | null = null;

  // Dummy-Daten für Stadtteile mit Min-Max normalisierten Indizes
  districts: District[] = [
    // Mannheim Stadtteile
    {
      id: 'ma-neckarstadt-ost',
      name: 'Neckarstadt-Ost',
      city: 'Mannheim',
      coordinates: [49.5058, 8.4944],
      kitas: 12,
      grundschulen: 4,
      kinderaerzte: 6,
      spielplaetze: 18,
      kinderanteil: 12.5,
      index: 4,
      color: '#abd9e9'
    },
    {
      id: 'ma-lindenhof',
      name: 'Lindenhof',
      city: 'Mannheim',
      coordinates: [49.4755, 8.4611],
      kitas: 8,
      grundschulen: 2,
      kinderaerzte: 3,
      spielplaetze: 12,
      kinderanteil: 9.8,
      index: 3,
      color: '#fdae61'
    },
    {
      id: 'ma-feudenheim',
      name: 'Feudenheim',
      city: 'Mannheim',
      coordinates: [49.5194, 8.5378],
      kitas: 15,
      grundschulen: 5,
      kinderaerzte: 8,
      spielplaetze: 22,
      kinderanteil: 14.2,
      index: 5,
      color: '#2166ac'
    },
    {
      id: 'ma-schwetzingerstadt',
      name: 'Schwetzingerstadt',
      city: 'Mannheim',
      coordinates: [49.4844, 8.4889],
      kitas: 6,
      grundschulen: 2,
      kinderaerzte: 2,
      spielplaetze: 8,
      kinderanteil: 8.1,
      index: 2,
      color: '#f46d43'
    },
    {
      id: 'ma-kaefertal',
      name: 'Käfertal',
      city: 'Mannheim',
      coordinates: [49.5278, 8.5056],
      kitas: 10,
      grundschulen: 3,
      kinderaerzte: 4,
      spielplaetze: 15,
      kinderanteil: 11.3,
      index: 3,
      color: '#fdae61'
    },

    // Kaiserslautern Stadtteile
    {
      id: 'kl-zentrum',
      name: 'Zentrum',
      city: 'Kaiserslautern',
      coordinates: [49.4447, 7.7689],
      kitas: 5,
      grundschulen: 2,
      kinderaerzte: 4,
      spielplaetze: 6,
      kinderanteil: 7.2,
      index: 2,
      color: '#f46d43'
    },
    {
      id: 'kl-west',
      name: 'West',
      city: 'Kaiserslautern',
      coordinates: [49.4389, 7.7444],
      kitas: 9,
      grundschulen: 3,
      kinderaerzte: 5,
      spielplaetze: 14,
      kinderanteil: 10.8,
      index: 4,
      color: '#abd9e9'
    },
    {
      id: 'kl-sued',
      name: 'Süd',
      city: 'Kaiserslautern',
      coordinates: [49.4278, 7.7667],
      kitas: 4,
      grundschulen: 1,
      kinderaerzte: 2,
      spielplaetze: 5,
      kinderanteil: 6.5,
      index: 1,
      color: '#d73027'
    },
    {
      id: 'kl-ost',
      name: 'Ost',
      city: 'Kaiserslautern',
      coordinates: [49.4500, 7.7944],
      kitas: 7,
      grundschulen: 2,
      kinderaerzte: 3,
      spielplaetze: 10,
      kinderanteil: 9.1,
      index: 3,
      color: '#fdae61'
    },
    {
      id: 'kl-nord',
      name: 'Nord',
      city: 'Kaiserslautern',
      coordinates: [49.4611, 7.7722],
      kitas: 6,
      grundschulen: 2,
      kinderaerzte: 3,
      spielplaetze: 9,
      kinderanteil: 8.7,
      index: 2,
      color: '#f46d43'
    }
  ];

  // Dummy-Daten für Einrichtungen
  facilities: Facility[] = [
    // Mannheim Einrichtungen (Beispiele)
    { id: 'ma-kita-1', name: 'Kita Regenbogen', type: 'kita', coordinates: [49.5058, 8.4950], district: 'ma-neckarstadt-ost' },
    { id: 'ma-schule-1', name: 'Neckarschule', type: 'grundschule', coordinates: [49.5065, 8.4940], district: 'ma-neckarstadt-ost' },
    { id: 'ma-arzt-1', name: 'Dr. Müller', type: 'kinderarzt', coordinates: [49.5052, 8.4935], district: 'ma-neckarstadt-ost' },
    { id: 'ma-spiel-1', name: 'Neckarspielplatz', type: 'spielplatz', coordinates: [49.5070, 8.4955], district: 'ma-neckarstadt-ost' },

    { id: 'ma-kita-2', name: 'Kita Lindenhof', type: 'kita', coordinates: [49.4755, 8.4615], district: 'ma-lindenhof' },
    { id: 'ma-schule-2', name: 'Lindenhofschule', type: 'grundschule', coordinates: [49.4750, 8.4605], district: 'ma-lindenhof' },

    // Kaiserslautern Einrichtungen (Beispiele)
    { id: 'kl-kita-1', name: 'Kita Stadtmitte', type: 'kita', coordinates: [49.4447, 7.7695], district: 'kl-zentrum' },
    { id: 'kl-schule-1', name: 'Grundschule Zentrum', type: 'grundschule', coordinates: [49.4450, 7.7685], district: 'kl-zentrum' },
    { id: 'kl-arzt-1', name: 'Dr. Schmidt', type: 'kinderarzt', coordinates: [49.4445, 7.7690], district: 'kl-zentrum' },

    { id: 'kl-kita-2', name: 'Kita West', type: 'kita', coordinates: [49.4389, 7.7450], district: 'kl-west' },
    { id: 'kl-schule-2', name: 'Westschule', type: 'grundschule', coordinates: [49.4385, 7.7440], district: 'kl-west' }
  ];

  onDistrictSelected(district: District) {
    if (district.city === 'Mannheim') {
      this.selectedMannheim = district;
    } else if (district.city === 'Kaiserslautern') {
      this.selectedKaiserslautern = district;
    }
  }
}
