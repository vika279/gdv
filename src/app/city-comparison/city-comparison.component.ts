import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import * as echarts from 'echarts';
import { FormsModule } from '@angular/forms';

interface DetailedStats {
  kindergarten: {
    total: number;
    offentlich: number;
    privat: number;
    kapazitat: number;
  };
  grundschulen: {
    total: number;
    schuler: number;
    lehrer: number;
    klassenzimmer: number;
  };
  spielplatze: {
    total: number;
    kleinkinder: number;
    schulkinder: number;
    sportanlagen: number;
  };
  gesundheit: {
    kinderarzte: number;
    apotheken: number;
    zahnarzte: number;
    therapeuten: number;
  };
  demographics: {
    einwohner: number;
    kinder_0_6: number;
    kinder_6_14: number;
    familien: number;
  };
  verkehr: {
    bushaltestellen: number;
    parkplatze: number;
    fahrradwege: number;
    verkehrssicherheit: number; // 1-5 scale
  };
}

interface GeoJsonFeature {
  type: 'Feature';
  properties: {
    name: string;
    stadt: string;
    [key: string]: any;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

interface DistrictData {
  id: string;
  name: string;
  city: string;
  geoJson: GeoJsonFeature;
  stats: DetailedStats;
  center: [number, number];
}

interface CityData {
  name: string;
  districts: DistrictData[];
  center: [number, number];
  bounds: [[number, number], [number, number]];
  color: string;
}

@Component({
  selector: 'app-city-comparison',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="city-comparison-container">
      <header class="main-header">
        <h1>Stadtvergleich: Kinderfreundlichkeit</h1>
        <p>Interaktive Analyse von Mannheim und Kaiserslautern</p>
      </header>

      <div class="main-layout">
        <!-- Sidebar mit Stadtauswahl und Details -->
        <aside class="sidebar">
          <div class="city-selector">
            <h3>Städte</h3>
            <div class="city-buttons">
              <button
                *ngFor="let city of cities"
                [class]="'city-btn ' + (selectedCity?.name === city.name ? 'active' : '')"
                [style.border-color]="city.color"
                (click)="selectCity(city)">
                {{city.name}}
                <span class="district-count">{{city.districts.length}} Stadtteile</span>
              </button>
            </div>
          </div>

          <div class="district-list" *ngIf="selectedCity">
            <h3>Stadtteile von {{selectedCity.name}}</h3>
            <div class="districts">
              <button
                *ngFor="let district of selectedCity.districts"
                [class]="'district-btn ' + (selectedDistrict?.id === district.id ? 'active' : '')"
                (click)="selectDistrict(district)">
                {{district.name}}
                <span class="population">{{district.stats.demographics.einwohner | number}} Einw.</span>
              </button>
            </div>
          </div>

          <div class="comparison-toggle">
            <h3>Vergleichsmodus</h3>
            <label class="toggle-switch">
              <input type="checkbox" [(ngModel)]="comparisonMode" (change)="toggleComparisonMode()">
              <span class="slider"></span>
              <span class="toggle-label">Städte vergleichen</span>
            </label>
          </div>
        </aside>

        <!-- Hauptinhalt -->
        <main class="main-content">
          <!-- Karte -->
          <section class="map-section">
            <div class="section-header">
              <h2>Übersichtskarte</h2>
              <div class="map-controls">
                <button
                  *ngFor="let layer of mapLayers"
                  [class]="'layer-btn ' + (layer.active ? 'active' : '')"
                  (click)="toggleMapLayer(layer)">
                  {{layer.name}}
                </button>
              </div>
            </div>
            <div class="map-container">
              <div id="main-map" class="map"></div>
              <div class="map-legend">
                <div class="legend-item" *ngFor="let city of cities">
                  <span class="legend-color" [style.background-color]="city.color"></span>
                  <span>{{city.name}}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Statistiken -->
          <section class="stats-section" *ngIf="selectedDistrict">
            <div class="section-header">
              <h2>Detailstatistiken: {{selectedDistrict.name}}</h2>
              <span class="city-badge" [style.background-color]="getCityColor(selectedDistrict.city)">
                {{selectedDistrict.city}}
              </span>
            </div>

            <div class="stats-grid">
              <!-- Demografie -->
              <div class="stat-card demographics">
                <h3><i class="icon-users"></i> Demografie</h3>
                <div class="stat-items">
                  <div class="stat-item">
                    <span class="label">Einwohner gesamt</span>
                    <span class="value">{{selectedDistrict.stats.demographics.einwohner | number}}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">Kinder 0-6 Jahre</span>
                    <span class="value">{{selectedDistrict.stats.demographics.kinder_0_6 | number}}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">Kinder 6-14 Jahre</span>
                    <span class="value">{{selectedDistrict.stats.demographics.kinder_6_14 | number}}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">Familien</span>
                    <span class="value">{{selectedDistrict.stats.demographics.familien | number}}</span>
                  </div>
                </div>
              </div>

              <!-- Kindergärten -->
              <div class="stat-card kindergarten">
                <h3><i class="icon-child"></i> Kindergärten & Kitas</h3>
                <div class="stat-items">
                  <div class="stat-item">
                    <span class="label">Gesamt</span>
                    <span class="value">{{selectedDistrict.stats.kindergarten.total}}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">Öffentlich</span>
                    <span class="value">{{selectedDistrict.stats.kindergarten.offentlich}}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">Privat</span>
                    <span class="value">{{selectedDistrict.stats.kindergarten.privat}}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">Kapazität</span>
                    <span class="value">{{selectedDistrict.stats.kindergarten.kapazitat}}</span>
                  </div>
                </div>
              </div>

              <!-- Schulen -->
              <div class="stat-card schools">
                <h3><i class="icon-school"></i> Grundschulen</h3>
                <div class="stat-items">
                  <div class="stat-item">
                    <span class="label">Schulen</span>
                    <span class="value">{{selectedDistrict.stats.grundschulen.total}}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">Schüler</span>
                    <span class="value">{{selectedDistrict.stats.grundschulen.schuler}}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">Lehrer</span>
                    <span class="value">{{selectedDistrict.stats.grundschulen.lehrer}}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">Klassenzimmer</span>
                    <span class="value">{{selectedDistrict.stats.grundschulen.klassenzimmer}}</span>
                  </div>
                </div>
              </div>

              <!-- Spielplätze -->
              <div class="stat-card playgrounds">
                <h3><i class="icon-playground"></i> Spielplätze</h3>
                <div class="stat-items">
                  <div class="stat-item">
                    <span class="label">Gesamt</span>
                    <span class="value">{{selectedDistrict.stats.spielplatze.total}}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">Kleinkinder</span>
                    <span class="value">{{selectedDistrict.stats.spielplatze.kleinkinder}}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">Schulkinder</span>
                    <span class="value">{{selectedDistrict.stats.spielplatze.schulkinder}}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">Sportanlagen</span>
                    <span class="value">{{selectedDistrict.stats.spielplatze.sportanlagen}}</span>
                  </div>
                </div>
              </div>

              <!-- Gesundheit -->
              <div class="stat-card health">
                <h3><i class="icon-health"></i> Gesundheitsversorgung</h3>
                <div class="stat-items">
                  <div class="stat-item">
                    <span class="label">Kinderärzte</span>
                    <span class="value">{{selectedDistrict.stats.gesundheit.kinderarzte}}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">Apotheken</span>
                    <span class="value">{{selectedDistrict.stats.gesundheit.apotheken}}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">Zahnärzte</span>
                    <span class="value">{{selectedDistrict.stats.gesundheit.zahnarzte}}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">Therapeuten</span>
                    <span class="value">{{selectedDistrict.stats.gesundheit.therapeuten}}</span>
                  </div>
                </div>
              </div>

              <!-- Verkehr -->
              <div class="stat-card transport">
                <h3><i class="icon-transport"></i> Verkehr & Mobilität</h3>
                <div class="stat-items">
                  <div class="stat-item">
                    <span class="label">Bushaltestellen</span>
                    <span class="value">{{selectedDistrict.stats.verkehr.bushaltestellen}}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">Parkplätze</span>
                    <span class="value">{{selectedDistrict.stats.verkehr.parkplatze}}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">Fahrradwege (km)</span>
                    <span class="value">{{selectedDistrict.stats.verkehr.fahrradwege}}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">Verkehrssicherheit</span>
                    <span class="value rating">
                      <span *ngFor="let star of [1,2,3,4,5]"
                            [class]="'star ' + (star <= selectedDistrict.stats.verkehr.verkehrssicherheit ? 'filled' : '')">
                        ★
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Diagramme für den ausgewählten Stadtteil -->
            <div class="charts-section">
              <div class="chart-container">
                <div id="district-pie-chart" class="chart"></div>
              </div>
              <div class="chart-container">
                <div id="district-bar-chart" class="chart"></div>
              </div>
            </div>
          </section>

          <!-- Vergleichsansicht -->
          <section class="comparison-section" *ngIf="comparisonMode">
            <div class="section-header">
              <h2>Städtevergleich</h2>
            </div>
            <div class="comparison-charts">
              <div class="comparison-chart">
                <div id="comparison-radar" class="chart"></div>
              </div>
              <div class="comparison-chart">
                <div id="comparison-heatmap" class="chart"></div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .city-comparison-container {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .main-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .main-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
      font-weight: 300;
    }

    .main-header p {
      margin: 0;
      opacity: 0.9;
      font-size: 1.2rem;
    }

    .main-layout {
      display: grid;
      grid-template-columns: 300px 1fr;
      min-height: calc(100vh - 140px);
    }

    /* Sidebar */
    .sidebar {
      background: white;
      border-right: 1px solid #e9ecef;
      padding: 1.5rem;
      overflow-y: auto;
    }

    .city-selector h3,
    .district-list h3,
    .comparison-toggle h3 {
      margin: 0 0 1rem 0;
      color: #495057;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .city-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 2rem;
    }

    .city-btn {
      padding: 1rem;
      border: 2px solid #e9ecef;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: left;
    }

    .city-btn:hover {
      background: #f8f9fa;
      transform: translateY(-1px);
    }

    .city-btn.active {
      background: #e3f2fd;
      border-color: #2196f3;
    }

    .district-count {
      display: block;
      font-size: 0.8rem;
      color: #6c757d;
      margin-top: 0.25rem;
    }

    .districts {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-bottom: 2rem;
      max-height: 300px;
      overflow-y: auto;
    }

    .district-btn {
      padding: 0.75rem;
      border: 1px solid #e9ecef;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
      font-size: 0.9rem;
    }

    .district-btn:hover {
      background: #f8f9fa;
    }

    .district-btn.active {
      background: #e8f5e8;
      border-color: #28a745;
    }

    .population {
      display: block;
      font-size: 0.75rem;
      color: #6c757d;
    }

    .toggle-switch {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .slider {
      width: 40px;
      height: 20px;
      background: #ccc;
      border-radius: 20px;
      position: relative;
      transition: 0.3s;
    }

    .slider:before {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: white;
      top: 2px;
      left: 2px;
      transition: 0.3s;
    }

    input:checked + .slider {
      background: #2196f3;
    }

    input:checked + .slider:before {
      transform: translateX(20px);
    }

    input[type="checkbox"] {
      display: none;
    }

    /* Main Content */
    .main-content {
      padding: 1.5rem;
      overflow-y: auto;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-header h2 {
      margin: 0;
      color: #495057;
      font-size: 1.5rem;
    }

    .city-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      color: white;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .map-controls {
      display: flex;
      gap: 0.5rem;
    }

    .layer-btn {
      padding: 0.5rem 1rem;
      border: 1px solid #dee2e6;
      background: white;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s ease;
    }

    .layer-btn:hover {
      background: #f8f9fa;
    }

    .layer-btn.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .map-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .map-container {
      position: relative;
    }

    .map {
      height: 500px;
      border-radius: 8px;
      border: 1px solid #dee2e6;
    }

    .map-legend {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(255,255,255,0.9);
      padding: 1rem;
      border-radius: 6px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 3px;
    }

    /* Statistics */
    .stats-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: #f8f9fa;
      border-radius: 10px;
      padding: 1.5rem;
      border-left: 4px solid;
    }

    .stat-card.demographics { border-left-color: #6f42c1; }
    .stat-card.kindergarten { border-left-color: #e83e8c; }
    .stat-card.schools { border-left-color: #fd7e14; }
    .stat-card.playgrounds { border-left-color: #20c997; }
    .stat-card.health { border-left-color: #dc3545; }
    .stat-card.transport { border-left-color: #0d6efd; }

    .stat-card h3 {
      margin: 0 0 1rem 0;
      color: #495057;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .stat-items {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #e9ecef;
    }

    .stat-item:last-child {
      border-bottom: none;
    }

    .stat-item .label {
      font-size: 0.9rem;
      color: #6c757d;
    }

    .stat-item .value {
      font-weight: 600;
      color: #495057;
    }

    .rating {
      display: flex;
      gap: 2px;
    }

    .star {
      // color: #ddd;
      font-size: 1.2rem;
    }

    .star.filled {
      color: #ffc107;
    }

    /* Charts */
    .charts-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .chart-container {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1rem;
    }

    .chart {
      height: 300px;
    }

    .comparison-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .comparison-charts {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .comparison-chart .chart {
      height: 400px;
    }

    /* Icons - Using Unicode symbols for now */
    .icon-users:before { content: '👥'; margin-right: 0.5rem; }
    .icon-child:before { content: '🧒'; margin-right: 0.5rem; }
    .icon-school:before { content: '🏫'; margin-right: 0.5rem; }
    .icon-playground:before { content: '🛝'; margin-right: 0.5rem; }
    .icon-health:before { content: '⚕️'; margin-right: 0.5rem; }
    .icon-transport:before { content: '🚌'; margin-right: 0.5rem; }

    /* Responsive */
    @media (max-width: 1200px) {
      .main-layout {
        grid-template-columns: 1fr;
      }

      .sidebar {
        border-right: none;
        border-bottom: 1px solid #e9ecef;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .charts-section,
      .comparison-charts {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .main-header {
        padding: 1rem;
      }

      .main-header h1 {
        font-size: 1.8rem;
      }

      .main-content {
        padding: 1rem;
      }

      .stat-items {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CityComparisonComponent implements OnInit, AfterViewInit {
  selectedCity: CityData | null = null;
  selectedDistrict: DistrictData | null = null;
  comparisonMode: boolean = false;

  cities: CityData[] = [];
  map: L.Map | null = null;
districtLayers: { [key: string]: L.GeoJSON } = {};
  charts: { [key: string]: echarts.ECharts } = {};

  mapLayers = [
    { name: 'Kindergärten', active: true, type: 'kindergarten' },
    { name: 'Schulen', active: true, type: 'schools' },
    { name: 'Spielplätze', active: false, type: 'playgrounds' },
    { name: 'Gesundheit', active: false, type: 'health' }
  ];

  ngOnInit() {
    this.initializeTestData();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initializeMap();
      if (this.cities.length > 0) {
        this.selectCity(this.cities[0]);
      }
    }, 100);
  }

  initializeTestData() {
    this.cities = [
      {
        name: 'Mannheim',
        center: [49.4875, 8.4660],
        bounds: [[49.4500, 8.4000], [49.5250, 8.5320]],
        color: '#e91e63',
        districts: this.generateMannheimDistricts()
      },
      {
        name: 'Kaiserslautern',
        center: [49.4447, 7.7689],
        bounds: [[49.4000, 7.7000], [49.4900, 7.8400]],
        color: '#4caf50',
        districts: this.generateKaiserslauternDistricts()
      }
    ];
  }

  generateMannheimDistricts(): DistrictData[] {
    const districts = [
      'Innenstadt-Ost', 'Innenstadt-Süd/West', 'Innenstadt-West/Mitte',
      'Schwetzingerstadt', 'Oststadt', 'Lindenhof', 'Neckarau',
      'Feudenheim', 'Wallstadt', 'Sandhofen'
    ];

    return districts.map((name, index) => ({
      id: `mannheim-${index}`,
      name,
      city: 'Mannheim',
      center: [49.4875 + (Math.random() - 0.5) * 0.05, 8.4660 + (Math.random() - 0.5) * 0.05],
      geoJson: this.generateMockGeoJson(name, 'Mannheim', [49.4875 + (Math.random() - 0.5) * 0.05, 8.4660 + (Math.random() - 0.5) * 0.05]),
      stats: this.generateDetailedStats()
    }));
  }

  generateKaiserslauternDistricts(): DistrictData[] {
    const districts = [
      'Innenstadt-Ost', 'Innenstadt-Süd/West', 'Innenstadt-West/Mitte',
      'Betzenberg', 'Grübenschlag/Volkspark', 'Bännjerrück',
      'Erlenbach', 'Morlautern', 'Dansenberg', 'Hohenecken'
    ];

    return districts.map((name, index) => ({
      id: `kaiserslautern-${index}`,
      name,
      city: 'Kaiserslautern',
      center: [49.4447 + (Math.random() - 0.5) * 0.04, 7.7689 + (Math.random() - 0.5) * 0.04],
      geoJson: this.generateMockGeoJson(name, 'Kaiserslautern', [49.4447 + (Math.random() - 0.5) * 0.04, 7.7689 + (Math.random() - 0.5) * 0.04]),
      stats: this.generateDetailedStats()
    }));
  }

  generateMockGeoJson(name: string, stadt: string, center: [number, number]): GeoJsonFeature {
    // Generate a simple polygon around the center point
    const offset = 0.005;
    const coordinates = [[
      [center[1] - offset, center[0] - offset],
      [center[1] + offset, center[0] - offset],
      [center[1] + offset, center[0] + offset],
      [center[1] - offset, center[0] + offset],
      [center[1] - offset, center[0] - offset]
    ]];

    return {
      type: 'Feature',
      properties: { name, stadt },
      geometry: {
        type: 'Polygon',
        coordinates
      }
    };
  }

  generateDetailedStats(): DetailedStats {
    return {
      kindergarten: {
        total: Math.floor(Math.random() * 12) + 3,
        offentlich: Math.floor(Math.random() * 8) + 2,
        privat: Math.floor(Math.random() * 5) + 1,
        kapazitat: Math.floor(Math.random() * 200) + 100
      },
      grundschulen: {
        total: Math.floor(Math.random() * 4) + 1,
        schuler: Math.floor(Math.random() * 400) + 150,
        lehrer: Math.floor(Math.random() * 25) + 10,
        klassenzimmer: Math.floor(Math.random() * 20) + 8
      },
      spielplatze: {
        total: Math.floor(Math.random() * 8) + 4,
        kleinkinder: Math.floor(Math.random() * 3) + 1,
        schulkinder: Math.floor(Math.random() * 4) + 2,
        sportanlagen: Math.floor(Math.random() * 3) + 1
      },
      gesundheit: {
        kinderarzte: Math.floor(Math.random() * 4) + 1,
        apotheken: Math.floor(Math.random() * 3) + 1,
        zahnarzte: Math.floor(Math.random() * 3) + 1,
        therapeuten: Math.floor(Math.random() * 5) + 2
      },
      demographics: {
        einwohner: Math.floor(Math.random() * 8000) + 2000,
        kinder_0_6: Math.floor(Math.random() * 400) + 100,
        kinder_6_14: Math.floor(Math.random() * 500) + 150,
        familien: Math.floor(Math.random() * 800) + 200
      },
      verkehr: {
        bushaltestellen: Math.floor(Math.random() * 8) + 2,
        parkplatze: Math.floor(Math.random() * 150) + 50,
        fahrradwege: Math.floor(Math.random() * 10) + 2,
        verkehrssicherheit: Math.floor(Math.random() * 5) + 1
      }
    };
  }

  initializeMap() {
    const mapElement = document.getElementById('main-map');
    if (!mapElement) return;

    this.map = L.map('main-map').setView([49.46, 8.12], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(this.map);

    this.loadAllDistricts();
  }

loadAllDistricts() {
  if (!this.map) return;

  this.cities.forEach(city => {
    city.districts.forEach(district => {
      const geoJsonLayer = L.geoJSON(district.geoJson, {
        style: {
          fillColor: city.color,
          weight: 2,
          opacity: 1,
          color: city.color,
          dashArray: '3',
          fillOpacity: 0.3
        },
        onEachFeature: (feature, layer: L.GeoJSON) => {
          // Popup mit Grundinformationen
          const popupContent = `
            <div class="district-popup">
              <h4>${district.name}</h4>
              <p><strong>Stadt:</strong> ${district.city}</p>
              <p><strong>Einwohner:</strong> ${district.stats.demographics.einwohner.toLocaleString()}</p>
              <p><strong>Kinder 0-14:</strong> ${(district.stats.demographics.kinder_0_6 + district.stats.demographics.kinder_6_14).toLocaleString()}</p>
              <hr>
              <p><strong>Kindergärten:</strong> ${district.stats.kindergarten.total}</p>
              <p><strong>Grundschulen:</strong> ${district.stats.grundschulen.total}</p>
              <p><strong>Spielplätze:</strong> ${district.stats.spielplatze.total}</p>
              <p><strong>Kinderärzte:</strong> ${district.stats.gesundheit.kinderarzte}</p>
            </div>
          `;

          layer.bindPopup(popupContent);

          // Click event für Stadtteil-Auswahl
          layer.on('click', () => {
            this.selectDistrict(district);
            this.highlightDistrict(district);
          });

          // Hover effects
          layer.on('mouseover', () => {
            (layer as L.GeoJSON).setStyle({
              weight: 3,
              fillOpacity: 0.5
            });
          });

          layer.on('mouseout', () => {
            (layer as L.GeoJSON).setStyle({
              weight: 2,
              fillOpacity: 0.3
            });
          });
        }
      }).addTo(this.map!);

      this.districtLayers[district.id] = geoJsonLayer;
    });
  });
}

  selectCity(city: CityData) {
    this.selectedCity = city;
    this.selectedDistrict = null;

    if (this.map) {
      // Zoom zur Stadt
      this.map.fitBounds(city.bounds);

      // Highlight alle Stadtteile dieser Stadt
      this.cities.forEach(c => {
        c.districts.forEach(d => {
          const layer = this.districtLayers[d.id];
          if (layer) {
            const isSelectedCity = c.name === city.name;
            (layer as any).setStyle({
              fillOpacity: isSelectedCity ? 0.5 : 0.1,
              weight: isSelectedCity ? 3 : 1
            });
          }
        });
      });
    }
  }

  selectDistrict(district: DistrictData) {
    this.selectedDistrict = district;

    // Aktualisiere auch die Stadtauswahl falls nötig
    const city = this.cities.find(c => c.name === district.city);
    if (city && this.selectedCity?.name !== city.name) {
      this.selectedCity = city;
    }

    // Erstelle Diagramme für den ausgewählten Stadtteil
    setTimeout(() => {
      this.createDistrictCharts(district);
    }, 100);
  }

  highlightDistrict(district: DistrictData) {
    // Reset alle Layer
    Object.values(this.districtLayers).forEach(layer => {
      (layer as any).setStyle({
        weight: 2,
        fillOpacity: 0.3
      });
    });

    // Highlight ausgewählten Stadtteil
    const selectedLayer = this.districtLayers[district.id];
    if (selectedLayer) {
      (selectedLayer as any).setStyle({
        weight: 4,
        fillOpacity: 0.7,
        color: '#ff6b35'
      });
    }

    // Zoom zum Stadtteil
    if (this.map) {
      this.map.setView(district.center, 14);
    }
  }

  createDistrictCharts(district: DistrictData) {
    this.createDistrictPieChart(district);
    this.createDistrictBarChart(district);
  }

  createDistrictPieChart(district: DistrictData) {
    const chartElement = document.getElementById('district-pie-chart');
    if (!chartElement) return;

    if (this.charts['district-pie']) {
      this.charts['district-pie'].dispose();
    }

    const chart = echarts.init(chartElement);

    const option = {
      title: {
        text: 'Einrichtungsverteilung',
        left: 'center',
        textStyle: { fontSize: 16 }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: { fontSize: 12 }
      },
      series: [
        {
          name: 'Einrichtungen',
          type: 'pie',
          radius: '60%',
          center: ['60%', '50%'],
          data: [
            { value: district.stats.kindergarten.total, name: 'Kindergärten', itemStyle: { color: '#e91e63' } },
            { value: district.stats.grundschulen.total, name: 'Grundschulen', itemStyle: { color: '#ff9800' } },
            { value: district.stats.spielplatze.total, name: 'Spielplätze', itemStyle: { color: '#4caf50' } },
            { value: district.stats.gesundheit.kinderarzte, name: 'Kinderärzte', itemStyle: { color: '#2196f3' } }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };

    chart.setOption(option);
    this.charts['district-pie'] = chart;
  }

  createDistrictBarChart(district: DistrictData) {
    const chartElement = document.getElementById('district-bar-chart');
    if (!chartElement) return;

    if (this.charts['district-bar']) {
      this.charts['district-bar'].dispose();
    }

    const chart = echarts.init(chartElement);

    const option = {
      title: {
        text: 'Detailstatistiken',
        left: 'center',
        textStyle: { fontSize: 16 }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['Kita\nKapazität', 'Schüler', 'Kinder\n0-6', 'Kinder\n6-14', 'Familien', 'Bus\nstops'],
        axisLabel: { fontSize: 10 }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Anzahl',
          type: 'bar',
          data: [
            district.stats.kindergarten.kapazitat,
            district.stats.grundschulen.schuler,
            district.stats.demographics.kinder_0_6,
            district.stats.demographics.kinder_6_14,
            district.stats.demographics.familien,
            district.stats.verkehr.bushaltestellen * 50 // Skalierung für bessere Darstellung
          ],
          itemStyle: {
            color: function(params: any) {
              const colors = ['#e91e63', '#ff9800', '#4caf50', '#2196f3', '#9c27b0', '#ff5722'];
              return colors[params.dataIndex];
            }
          }
        }
      ]
    };

    chart.setOption(option);
    this.charts['district-bar'] = chart;
  }

  toggleComparisonMode() {
    if (this.comparisonMode) {
      setTimeout(() => {
        this.createComparisonCharts();
      }, 100);
    }
  }

  createComparisonCharts() {
    this.createComparisonRadar();
    this.createComparisonHeatmap();
  }

  createComparisonRadar() {
    const chartElement = document.getElementById('comparison-radar');
    if (!chartElement) return;

    if (this.charts['comparison-radar']) {
      this.charts['comparison-radar'].dispose();
    }

    const chart = echarts.init(chartElement);

    const mannheimTotals = this.calculateCityTotals('Mannheim');
    const kaiserslauternTotals = this.calculateCityTotals('Kaiserslautern');

    const option = {
      title: {
        text: 'Städtevergleich - Gesamtübersicht',
        left: 'center'
      },
      tooltip: {},
      legend: {
        data: ['Mannheim', 'Kaiserslautern'],
        bottom: 10
      },
      radar: {
        indicator: [
          { name: 'Kindergärten', max: Math.max(mannheimTotals.kindergarten, kaiserslauternTotals.kindergarten) * 1.2 },
          { name: 'Grundschulen', max: Math.max(mannheimTotals.grundschulen, kaiserslauternTotals.grundschulen) * 1.2 },
          { name: 'Spielplätze', max: Math.max(mannheimTotals.spielplatze, kaiserslauternTotals.spielplatze) * 1.2 },
          { name: 'Kinderärzte', max: Math.max(mannheimTotals.kinderarzte, kaiserslauternTotals.kinderarzte) * 1.2 },
          { name: 'Einwohner', max: Math.max(mannheimTotals.einwohner, kaiserslauternTotals.einwohner) * 1.2 },
          { name: 'Kinder gesamt', max: Math.max(mannheimTotals.kinder, kaiserslauternTotals.kinder) * 1.2 }
        ]
      },
      series: [{
        name: 'Städtevergleich',
        type: 'radar',
        data: [
          {
            value: [
              mannheimTotals.kindergarten,
              mannheimTotals.grundschulen,
              mannheimTotals.spielplatze,
              mannheimTotals.kinderarzte,
              mannheimTotals.einwohner,
              mannheimTotals.kinder
            ],
            name: 'Mannheim',
            itemStyle: { color: '#e91e63' }
          },
          {
            value: [
              kaiserslauternTotals.kindergarten,
              kaiserslauternTotals.grundschulen,
              kaiserslauternTotals.spielplatze,
              kaiserslauternTotals.kinderarzte,
              kaiserslauternTotals.einwohner,
              kaiserslauternTotals.kinder
            ],
            name: 'Kaiserslautern',
            itemStyle: { color: '#4caf50' }
          }
        ]
      }]
    };

    chart.setOption(option);
    this.charts['comparison-radar'] = chart;
  }

  createComparisonHeatmap() {
    const chartElement = document.getElementById('comparison-heatmap');
    if (!chartElement) return;

    if (this.charts['comparison-heatmap']) {
      this.charts['comparison-heatmap'].dispose();
    }

    const chart = echarts.init(chartElement);

    // Erstelle Heatmap-Daten pro Stadtteil
    const allDistricts = [...this.cities[0].districts, ...this.cities[1].districts];
    const categories = ['Kindergärten', 'Grundschulen', 'Spielplätze', 'Kinderärzte'];

    const data: any[] = [];
    allDistricts.forEach((district, districtIndex) => {
      const values = [
        district.stats.kindergarten.total,
        district.stats.grundschulen.total,
        district.stats.spielplatze.total,
        district.stats.gesundheit.kinderarzte
      ];

      values.forEach((value, categoryIndex) => {
        data.push([categoryIndex, districtIndex, value]);
      });
    });

    const option = {
      title: {
        text: 'Stadtteil-Heatmap',
        left: 'center'
      },
      tooltip: {
        position: 'top',
        formatter: function(params: any) {
          const categoryName = categories[params.data[0]];
          const districtName = allDistricts[params.data[1]].name;
          const cityName = allDistricts[params.data[1]].city;
          return `${districtName} (${cityName})<br/>${categoryName}: ${params.data[2]}`;
        }
      },
      grid: {
        height: '70%',
        top: '10%'
      },
      xAxis: {
        type: 'category',
        data: categories,
        splitArea: {
          show: true
        }
      },
      yAxis: {
        type: 'category',
        data: allDistricts.map(d => `${d.name}\n(${d.city})`),
        splitArea: {
          show: true
        },
        axisLabel: {
          fontSize: 9
        }
      },
      visualMap: {
        min: 0,
        max: Math.max(...data.map(d => d[2])),
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '5%',
        inRange: {
          color: ['#f7fbff', '#08519c']
        }
      },
      series: [{
        name: 'Einrichtungen',
        type: 'heatmap',
        data: data,
        label: {
          show: true,
          fontSize: 9
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };

    chart.setOption(option);
    this.charts['comparison-heatmap'] = chart;
  }

  calculateCityTotals(cityName: string) {
    const city = this.cities.find(c => c.name === cityName);
    if (!city) return { kindergarten: 0, grundschulen: 0, spielplatze: 0, kinderarzte: 0, einwohner: 0, kinder: 0 };

    return city.districts.reduce((totals, district) => ({
      kindergarten: totals.kindergarten + district.stats.kindergarten.total,
      grundschulen: totals.grundschulen + district.stats.grundschulen.total,
      spielplatze: totals.spielplatze + district.stats.spielplatze.total,
      kinderarzte: totals.kinderarzte + district.stats.gesundheit.kinderarzte,
      einwohner: totals.einwohner + district.stats.demographics.einwohner,
      kinder: totals.kinder + district.stats.demographics.kinder_0_6 + district.stats.demographics.kinder_6_14
    }), { kindergarten: 0, grundschulen: 0, spielplatze: 0, kinderarzte: 0, einwohner: 0, kinder: 0 });
  }

  toggleMapLayer(layer: any) {
    layer.active = !layer.active;
    // Hier könntest du die Sichtbarkeit verschiedener Layer auf der Karte umschalten
  }

  getCityColor(cityName: string): string {
    const city = this.cities.find(c => c.name === cityName);
    return city ? city.color : '#6c757d';
  }

  getTotalByType(cityName: string, type: 'kita' | 'grundschule' | 'spielplatz' | 'kinderarzt'): number {
    const city = this.cities.find(c => c.name === cityName);
    if (!city) return 0;

    return city.districts.reduce((sum, district) => {
      switch (type) {
        case 'kita': return sum + district.stats.kindergarten.total;
        case 'grundschule': return sum + district.stats.grundschulen.total;
        case 'spielplatz': return sum + district.stats.spielplatze.total;
        case 'kinderarzt': return sum + district.stats.gesundheit.kinderarzte;
        default: return sum;
      }
    }, 0);
  }
}
