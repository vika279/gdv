import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { District, Facility } from '../app.component';

declare var L: any;

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],

  // TEMPLATE:
  template: `
    <div class="maps-container">
      <div class="map-wrapper">
        <div class="map-header">
          <h3>Mannheim</h3>
          <select
            class="district-select"
            [value]="selectedMannheimDistrict"
            (change)="onDistrictChange($event, 'mannheim')"
          >
            <option value="">Gesamt</option>
            <option
              *ngFor="let district of mannheimDistricts"
              [value]="district.id"
            >
              {{ district.name }}
            </option>
          </select>
        </div>
        <div class="map-container">
          <div id="map-mannheim" class="map"></div>
          <div class="map-overlay">
            <div class="rating-badge mannheim-rating">
              {{ getCurrentMannheimRating() }}/5
            </div>
          </div>
          <div class="legend">
            <div class="legend-title">Kinderfreundlichkeit</div>
            <div class="legend-scale">
              <div class="legend-item" *ngFor="let item of mannheimLegend">
                <div
                  class="legend-color"
                  [style.background-color]="item.color"
                ></div>
                <span>{{ item.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="map-wrapper">
        <div class="map-header">
          <h3>Kaiserslautern</h3>
          <select
            class="district-select"
            [value]="selectedKaiserslauternDistrict"
            (change)="onDistrictChange($event, 'kaiserslautern')"
          >
            <option value="">Gesamt</option>
            <option
              *ngFor="let district of kaiserslauternDistricts"
              [value]="district.id"
            >
              {{ district.name }}
            </option>
          </select>
        </div>
        <div class="map-container">
          <div id="map-kaiserslautern" class="map"></div>
          <div class="map-overlay">
            <div class="rating-badge kaiserslautern-rating">
              {{ getCurrentKaiserslauternRating() }}/5
            </div>
          </div>
          <div class="legend">
            <div class="legend-title">Kinderfreundlichkeit</div>
            <div class="legend-scale">
              <div
                class="legend-item"
                *ngFor="let item of kaiserslauternLegend"
              >
                <div
                  class="legend-color"
                  [style.background-color]="item.color"
                ></div>
                <span>{{ item.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  // STYLES:
  styles: [
    `
      .maps-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.875rem;
        height: calc(100vh - 12.5rem);
        width: 100%;
        align-items: stretch;
        padding-bottom: 0.5rem;
      }

      @media (max-width: 64rem) { /* 1024px */
        .maps-container {
          grid-template-columns: 1fr;
          gap: 1.25rem;
          height: auto;
        }
      }

      .map-wrapper {
        background: white;
        border-radius: 0.75rem;
        box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
        overflow: hidden;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .map-header {
        padding: 1.25rem 1.25rem 0.625rem 1.25rem;
        display: flex;
        gap: 1.875rem;
        align-items: center;
      }

      .map-header h3 {
        margin: 0;
        color: #333;
        font-weight: 700;
        font-size: clamp(1.2rem, 2vw, 1.5rem);
        white-space: nowrap;
      }

      .district-select {
        width: 100%;
        padding: 0.5rem 0.9375rem;
        border: 2px solid #e9ecef;
        border-radius: 0.5rem;
        background: white;
        font-size: clamp(0.9rem, 1.5vw, 1.3rem);
        color: #666;
        cursor: pointer;
        transition: border-color 0.2s;
      }

      .map-container {
        position: relative;
        flex: 1;
        width: 100%;
        min-height: 16rem;
      }

      .map {
        height: 100%;
        width: 100%;
      }

      @media (max-width: 48rem) { /* 768px */
        .map-container {
          min-height: 14rem;
        }

        .map-header {
          padding: 0.9375rem 0.9375rem 0.5rem 0.9375rem;
          gap: 0.9375rem;
        }

        .district-select {
          padding: 0.375rem 0.75rem;
        }
      }

      @media (max-width: 30rem) { /* 480px */
        .map-container {
          min-height: 12rem;
        }

        .map-header {
          padding: 0.625rem 0.625rem 0.375rem 0.625rem;
          gap: 0.625rem;
        }
      }

      .map-overlay {
        position: absolute;
        top: 1.25rem;
        right: 1.25rem;
        z-index: 1000;
      }

      .rating-badge {
        background: white;
        padding: 1rem 0.875rem;
        border-radius: 2.5rem;
        font-weight: bold;
        font-size: 1.1rem;
        box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.15);
        color: white;
      }

      .mannheim-rating {
        background: #dc3545;
      }

      .kaiserslautern-rating {
        background: #007bff;
      }

      .legend {
        position: absolute;
        bottom: 0.5rem;
        right: 0.5rem;
        background: white;
        padding: 0.5rem;
        border-radius: 0.5rem;
        z-index: 1001;
      }

      .legend-title {
        font-weight: 600;
        font-size: 0.8rem;
        color: #333;
        margin-bottom: 0.25rem;
        text-align: left;
      }

      .legend-scale {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .legend-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 0.7rem;
        color: #666;
      }

      .legend-color {
        width: 0.875rem;
        height: 0.875rem;
        border-radius: 0.125rem;
        margin-bottom: 0.125rem;
      }

      /* Leaflet Overrides */
      :host ::ng-deep .leaflet-popup-content-wrapper {
        background: white;
        //  border-radius: 8px;
        // box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      :host ::ng-deep .leaflet-popup-content {
        margin: 15px 18px;
        line-height: 1.4;
        font-size: 0.9rem;
      }

      :host ::ng-deep .district-popup h4 {
        margin: 0 0 10px 0;
        color: #333;
        font-size: 1.1rem;
        font-weight: 600;
      }

      :host ::ng-deep .district-popup .popup-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        font-size: 0.85rem;
        color: #666;
        margin-bottom: 10px;
      }

      :host ::ng-deep .district-popup .heatmap-value {
        margin-bottom: 8px;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        color: #495057;
      }

      /* Zoom-Kontrollen ausblenden */
      :host ::ng-deep .leaflet-control-zoom {
        display: none !important;
      }

      :host ::ng-deep .leaflet-container {
        background: white !important;
        // outline-offset: 1px;
      }

      :host ::ng-deep .leaflet-control-attribution {
        font-size: 10px !important;
        background: rgba(255, 255, 255, 0.8) !important;
      }

      /* Polygon-Styles */
      :host ::ng-deep .district-polygon {
        transition: all 0.2s ease;
        z-index: 1;
      }

      :host ::ng-deep .district-polygon:hover {
        fill-opacity: 0.9 !important;
        stroke-width: 3 !important;
        z-index: 2;
      }

      /* Transparenz-Styles für nicht-ausgewählte Bezirke */
      :host ::ng-deep .district-polygon-faded {
        fill-opacity: 0.3 !important;
        transition: all 0.3s ease;
        z-index: 1;
      }

      :host ::ng-deep .district-polygon-selected {
        fill-opacity: 0.9 !important;
        stroke-width: 3 !important;
        transition: all 0.3s ease;
        z-index: 999 !important;
      }

      /* Custom Marker Styles */
      :host ::ng-deep .custom-marker {
        transition: transform 0.2s ease;
      }

      :host ::ng-deep .custom-marker:hover {
        transform: scale(1.1);
      }

      #map-mannheim {
        transform-origin: center;
      }
    `,
  ],
})
export class MapComponent implements OnInit, OnDestroy {
  @Input() districts: District[] = [];
  @Input() facilities: Facility[] = [];
  @Output() districtSelected = new EventEmitter<District>();

  private mapMannheim: any;
  private mapKaiserslautern: any;
  private isClient = false;
  private mannheimGeoJsonLayer: any;
  private kaiserslauternGeoJsonLayer: any;
  private geoJsonLoaded = { mannheim: false, kaiserslautern: false };

  // Heatmap-Daten als Klassenvariablen
  private mannheimHeatmapData: { [key: string]: number } = {
    'Innenstadt/Jungbusch': 2,
    'Neckarstadt-West': 3,
    Lindenhof: 2,
    Schönau: 3,
    Sandhofen: 2,
    Neckarau: 2,
    Waldhof: 2,
    'Neckarstadt-Ost': 2,
    'Schwetzingerstadt/Oststadt': 4,
    'Neuostheim/Neuhermsheim': 3,
    Rheinau: 2,
    Käfertal: 3,
    Vogelstang: 3,
    Feudenheim: 2,
    Seckenheim: 3,
    Wallstadt: 4,
    Friedrichsfeld: 2,
  };

  private kaiserslauternHeatmapData: { [key: string]: number } = {
    Betzenberg: 4,
    'Bännjerrück/Karl-Pfaff-S.': 4,
    Dansenberg: 3,
    Einsiedlerhof: 3,
    Erfenbach: 2,
    Erlenbach: 2,
    'Erzhütten/Wiesenthalerhof': 2,
    'Grübentälchen/Volkspark': 2,
    Hohenecken: 4,
    'Innenstadt Nord/Kaiserberg': 1,
    'Innenstadt-Ost': 3,
    'Innenstadt-Südwest': 2,
    'Innenstadt West/Kotten': 1,
    'Kaiserslautern-West': 1,
    'Lämmchesberg/Uniwohnstadt': 5,
    Morlautern: 3,
    Mölschbach: 2,
    Siegelbach: 2,
  };

  // Tracking ausgewählter Bezirke für Dropdown-Synchronisation
  selectedMannheimDistrict: string = '';
  selectedKaiserslauternDistrict: string = '';

  mannheimDistricts: District[] = [];
  kaiserslauternDistricts: District[] = [];

  // Legende-Daten
  mannheimLegend = [
    { value: 1, color: '#e6a9ab' },
    { value: 2, color: '#da7d81' },
    { value: 3, color: '#cd5257' },
    { value: 4, color: '#c1272d' },
    { value: 5, color: '#911d22' },
  ];

  kaiserslauternLegend = [
    { value: 1, color: '#87cff8' },
    { value: 2, color: '#6bb6ff' },
    { value: 3, color: '#4682b4' },
    { value: 4, color: '#2d5a87' },
    { value: 5, color: '#1a365d' },
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) {
    this.isClient = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.mannheimDistricts = this.districts.filter(
      (d) => d.city === 'Mannheim'
    );
    this.kaiserslauternDistricts = this.districts.filter(
      (d) => d.city === 'Kaiserslautern'
    );

    // Gesamtwerte bei Initialisierung setzen
    const mannheimGesamt = this.districts.find(d => d.city === 'Mannheim' && d.name === 'Gesamt');
    const kaiserslauternGesamt = this.districts.find(d => d.city === 'Kaiserslautern' && d.name === 'Gesamt');

    if (mannheimGesamt) {
      this.districtSelected.emit(mannheimGesamt);
    }
    if (kaiserslauternGesamt) {
      this.districtSelected.emit(kaiserslauternGesamt);
    }

    if (this.isClient) {
      this.loadLeaflet();
    }
  }

  ngOnDestroy() {
    if (this.mapMannheim) {
      this.mapMannheim.remove();
    }
    if (this.mapKaiserslautern) {
      this.mapKaiserslautern.remove();
    }
    // Entferne den Resize-Event-Listener
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  onDistrictChange(event: any, city: string) {
    const districtId = event.target.value;

    if (districtId === '') {
      this.resetAllDistrictsVisibility(city);
      if (city === 'mannheim') {
        this.selectedMannheimDistrict = '';
        const mannheimGesamt = this.districts.find(d => d.city === 'Mannheim' && d.name === 'Gesamt');
        if (mannheimGesamt) {
          this.districtSelected.emit(mannheimGesamt);
        }
      } else {
        this.selectedKaiserslauternDistrict = '';
        const kaiserslauternGesamt = this.districts.find(d => d.city === 'Kaiserslautern' && d.name === 'Gesamt');
        if (kaiserslauternGesamt) {
          this.districtSelected.emit(kaiserslauternGesamt);
        }
      }
    } else {
      const districts = city === 'mannheim' ? this.mannheimDistricts : this.kaiserslauternDistricts;
      const selectedDistrict = districts.find((d) => d.id === districtId);

      if (selectedDistrict) {
        this.selectDistrict(selectedDistrict, city);
      }
    }
  }

  getCurrentMannheimRating(): number {
    if (
      this.selectedMannheimDistrict &&
      this.selectedMannheimDistrict !== '' &&
      this.selectedMannheimDistrict !== 'gesamt'
    ) {
      const district = this.mannheimDistricts.find(
        (d) => d.id === this.selectedMannheimDistrict
      );
      if (district) {
        return this.mannheimHeatmapData[district.name] || 0;
      }
    }
    // Durchschnitt der Heatmap-Werte berechnen
    const values = Object.values(this.mannheimHeatmapData);
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }

  getCurrentKaiserslauternRating(): number {
    if (
      this.selectedKaiserslauternDistrict &&
      this.selectedKaiserslauternDistrict !== '' &&
      this.selectedKaiserslauternDistrict !== 'gesamt'
    ) {
      const district = this.kaiserslauternDistricts.find(
        (d) => d.id === this.selectedKaiserslauternDistrict
      );
      if (district) {
        return this.kaiserslauternHeatmapData[district.name] || 0;
      }
    }
    // Durchschnitt der Heatmap-Werte berechnen
    const values = Object.values(this.kaiserslauternHeatmapData);
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }

  private selectDistrict(district: District, city: string) {
    // Dropdown-Wert aktualisieren
    if (city === 'mannheim') {
      this.selectedMannheimDistrict = district.id;
    } else {
      this.selectedKaiserslauternDistrict = district.id;
    }

    // Transparenz-Effekt anwenden
    this.applyTransparencyEffect(district.id, city);

    // Event emittieren
    this.districtSelected.emit(district);
  }

  private applyTransparencyEffect(selectedDistrictId: string, city: string) {
    // Nur die ausgewählte Stadt behandeln
    if (city === 'mannheim' && this.mannheimGeoJsonLayer) {
      this.mannheimGeoJsonLayer.eachLayer((featureLayer: any) => {
        const feature = featureLayer.feature;
        const districtName = this.getDistrictNameFromFeature(
          feature,
          'Mannheim'
        );
        const matchingDistrict = this.findMatchingDistrict(
          districtName,
          this.mannheimDistricts
        );

        if (matchingDistrict) {
          if (matchingDistrict.id === selectedDistrictId) {
            // Ausgewählter Bezirk - normal sichtbar mit dunkelrotem Rand
            featureLayer.setStyle({
              fillOpacity: 0.9,
              weight: 3,
              className: 'district-polygon-selected',
              color: 'rgb(145, 29, 34)'
            });
            featureLayer.bringToFront();
          } else {
            // Andere Bezirke - transparent mit weißem Rand
            featureLayer.setStyle({
              fillOpacity: 0.3,
              weight: 1,
              className: 'district-polygon-faded',
              color: '#ffffff'
            });
          }
        }
      });
    } else if (city === 'kaiserslautern' && this.kaiserslauternGeoJsonLayer) {
      this.kaiserslauternGeoJsonLayer.eachLayer((featureLayer: any) => {
        const feature = featureLayer.feature;
        const districtName = this.getDistrictNameFromFeature(
          feature,
          'Kaiserslautern'
        );
        const matchingDistrict = this.findMatchingDistrict(
          districtName,
          this.kaiserslauternDistricts
        );

        if (matchingDistrict) {
          if (matchingDistrict.id === selectedDistrictId) {
            // Ausgewählter Bezirk - normal sichtbar mit dunkelblauem Rand
            featureLayer.setStyle({
              fillOpacity: 0.9,
              weight: 3,
              className: 'district-polygon-selected',
              color: 'rgb(26, 54, 93)'
            });
            featureLayer.bringToFront();
          } else {
            // Andere Bezirke - transparent mit weißem Rand
            featureLayer.setStyle({
              fillOpacity: 0.3,
              weight: 1,
              className: 'district-polygon-faded',
              color: '#ffffff'
            });
          }
        }
      });
    }
  }

  private resetAllDistrictsVisibility(city: string) {
    // Nur die entsprechende Stadt zurücksetzen
    if (city === 'mannheim' && this.mannheimGeoJsonLayer) {
      this.mannheimGeoJsonLayer.eachLayer((featureLayer: any) => {
        featureLayer.setStyle({
          fillOpacity: 0.8,
          weight: 2,
          className: 'district-polygon',
          color: '#ffffff'
        });
      });
    } else if (city === 'kaiserslautern' && this.kaiserslauternGeoJsonLayer) {
      this.kaiserslauternGeoJsonLayer.eachLayer((featureLayer: any) => {
        featureLayer.setStyle({
          fillOpacity: 0.8,
          weight: 2,
          className: 'district-polygon',
          color: '#ffffff'
        });
      });
    }
  }

  getMannheimFacilities(): Facility[] {
    return this.facilities.filter((f) =>
      this.mannheimDistricts.some((d) => d.id === f.district)
    );
  }

  getKaiserslauternFacilities(): Facility[] {
    return this.facilities.filter((f) =>
      this.kaiserslauternDistricts.some((d) => d.id === f.district)
    );
  }

  private loadLeaflet() {
    if (typeof L === 'undefined') {
      const script = document.createElement('script');
      script.src =
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      script.onload = () => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href =
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
        document.head.appendChild(link);
        setTimeout(() => this.initMaps(), 100);
      };
      document.head.appendChild(script);
    } else {
      this.initMaps();
    }
  }

  private initMaps() {
    const staticMapOptions = {
      zoomControl: false,
      doubleClickZoom: false,
      scrollWheelZoom: false,
      boxZoom: false,
      keyboard: false,
      dragging: false,
      touchZoom: false,
      attributionControl: false,
    };

    // MANNHEIM
    this.mapMannheim = L.map('map-mannheim', staticMapOptions);

    // KAISERSLAUTERN
    this.mapKaiserslautern = L.map('map-kaiserslautern', staticMapOptions);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      opacity: 0.0,
    }).addTo(this.mapMannheim);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      opacity: 0.0,
    }).addTo(this.mapKaiserslautern);

    this.loadGeoJsonData();

    // Event-Listener für Klicks außerhalb der Polygone
    this.mapMannheim.on('click', (e: any) => {
      if (!e.originalEvent.target.classList.contains('leaflet-interactive')) {
        this.selectedMannheimDistrict = '';
        this.resetAllDistrictsVisibility('mannheim');
        const mannheimGesamt = this.districts.find(d => d.city === 'Mannheim' && d.name === 'Gesamt');
        if (mannheimGesamt) {
          this.districtSelected.emit(mannheimGesamt);
        }
      }
    });

    this.mapKaiserslautern.on('click', (e: any) => {
      if (!e.originalEvent.target.classList.contains('leaflet-interactive')) {
        this.selectedKaiserslauternDistrict = '';
        this.resetAllDistrictsVisibility('kaiserslautern');
        const kaiserslauternGesamt = this.districts.find(d => d.city === 'Kaiserslautern' && d.name === 'Gesamt');
        if (kaiserslauternGesamt) {
          this.districtSelected.emit(kaiserslauternGesamt);
        }
      }
    });

    // Fenster-Resize-Event-Handler
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  private handleResize() {
    if (this.mapMannheim && this.mapKaiserslautern) {
      setTimeout(() => {
        this.mapMannheim.invalidateSize();
        this.mapKaiserslautern.invalidateSize();

        if (this.mannheimGeoJsonLayer) {
          const mannheimBounds = this.mannheimGeoJsonLayer.getBounds();
          this.mapMannheim.fitBounds(mannheimBounds, { padding: [20, 20] });
        }

        if (this.kaiserslauternGeoJsonLayer) {
          const kaiserslauternBounds = this.kaiserslauternGeoJsonLayer.getBounds();
          this.mapKaiserslautern.fitBounds(kaiserslauternBounds, { padding: [20, 20] });
        }
      }, 100);
    }
  }

  private loadGeoJsonData() {
    // Kaiserslautern GeoJSON
    this.http.get('assets/data/KA_map.geojson').subscribe({
      next: (geoJsonData: any) => {
        this.addGeoJsonToMap(
          geoJsonData,
          this.mapKaiserslautern,
          'Kaiserslautern'
        );
        this.geoJsonLoaded.kaiserslautern = true;
      },
      error: (error) => {
        console.error('Fehler beim Laden der Kaiserslautern GeoJSON:', error);
        this.geoJsonLoaded.kaiserslautern = false;
       // this.addCirclesForCity('Kaiserslautern');
      },
    });

    // Mannheim GeoJSON
    this.http.get('assets/data/MA_map.geojson').subscribe({
      next: (geoJsonData: any) => {
        this.addGeoJsonToMap(geoJsonData, this.mapMannheim, 'Mannheim');
        this.geoJsonLoaded.mannheim = true;
      },
      error: (error) => {
        console.warn('Mannheim GeoJSON nicht gefunden:', error);
        this.geoJsonLoaded.mannheim = false;
       // this.addCirclesForCity('Mannheim');
      },
    });
  }

  private addGeoJsonToMap(geoJsonData: any, map: any, cityName: string) {
    const districts =
      cityName === 'Mannheim'
        ? this.mannheimDistricts
        : this.kaiserslauternDistricts;

    const getHeatmapColor = (value: number, cityName: string): string => {
      if (cityName === 'Mannheim') {
        const colorMap: { [key: number]: string } = {
          5: '#911d22',
          4: '#c1272d',
          3: '#cd5257',
          2: '#da7d81',
          1: '#e6a9ab',
        };
        return colorMap[value] || '#cccccc';
      } else if (cityName === 'Kaiserslautern') {
        const colorMap: { [key: number]: string } = {
          5: '#1a365d',
          4: '#2d5a87',
          3: '#4682b4',
          2: '#6bb6ff',
          1: '#83c5eb',
        };
        return colorMap[value] || '#zzzzg';
      }
      return '#cccccc';
    };

    const geoJsonLayer = L.geoJSON(geoJsonData, {
      style: (feature: any) => {
        const districtName = this.getDistrictNameFromFeature(feature, cityName);
        let fillColor: string;

        if (cityName === 'Mannheim') {
          const heatmapValue = this.mannheimHeatmapData[districtName] || 0;
          fillColor =
            heatmapValue > 0
              ? getHeatmapColor(heatmapValue, cityName)
              : '#cccccc';
        } else if (cityName === 'Kaiserslautern') {
          const heatmapValue = this.kaiserslauternHeatmapData[districtName] || 0;
          fillColor =
            heatmapValue > 0
              ? getHeatmapColor(heatmapValue, cityName)
              : 'black';
        } else {
          fillColor = 'red';
        }

        return {
          fillColor: fillColor,
          weight: 2,
          opacity: 1.0,
          color: '#ffffff',
          fillOpacity: 0.8,
          className: 'district-polygon',
        };
      },
      onEachFeature: (feature: any, layer: any) => {
        const districtName = this.getDistrictNameFromFeature(feature, cityName);
        const district = this.findMatchingDistrict(districtName, districts);

        if (district) {
          // Nur Click-Event für Auswahl
          layer.on('click', () => {
            this.selectDistrict(
              district,
              cityName === 'Mannheim' ? 'mannheim' : 'kaiserslautern'
            );
          });
        }

        // Hover-Effekte mit einfachem Tooltip
        layer.on({
          mouseover: (e: any) => {
            const layer = e.target;
            layer.setStyle({
              fillOpacity: 0.9,
              weight: 3,
              color: '#ffffff',
            });
            layer.bindTooltip(districtName, {
              direction: 'top',
              className: 'district-tooltip',
              opacity: 0.9,
              permanent: true,
            });
          },
          mouseout: (e: any) => {
            const layer = e.target;
            const districtName = this.getDistrictNameFromFeature(
              layer.feature,
              cityName
            );
            const district = this.findMatchingDistrict(districtName, districts);

            const isSelected =
              district &&
              ((cityName === 'Mannheim' &&
                this.selectedMannheimDistrict === district.id) ||
                (cityName === 'Kaiserslautern' &&
                  this.selectedKaiserslauternDistrict === district.id));

            const hasSelection =
              (cityName === 'Mannheim' &&
                this.selectedMannheimDistrict &&
                this.selectedMannheimDistrict !== '') ||
              (cityName === 'Kaiserslautern' &&
                this.selectedKaiserslauternDistrict &&
                this.selectedKaiserslauternDistrict !== '');

            layer.setStyle({
              fillOpacity: isSelected ? 0.9 : hasSelection ? 0.3 : 0.8,
              weight: isSelected ? 3 : 2,
              color: isSelected ? (cityName === 'Mannheim' ? 'rgb(145, 29, 34)' : 'rgb(26, 54, 93)') : '#ffffff',
            });

            // Tooltip schließen
            layer.closeTooltip();
          },
        });
      },
    }).addTo(map);

    // Store the layer reference
    if (cityName === 'Mannheim') {
      this.mannheimGeoJsonLayer = geoJsonLayer;
    } else {
      this.kaiserslauternGeoJsonLayer = geoJsonLayer;
    }

    // Fit bounds with padding
    const bounds = geoJsonLayer.getBounds();
    map.fitBounds(bounds, { padding: [20, 20] });
  }

  private getDistrictNameFromFeature(feature: any, cityName: string): string {
    if (cityName === 'Kaiserslautern') {
      return feature.properties.PGIS_TXT || '';
    } else {
      return feature.properties.name || '';
    }
  }

  private findMatchingDistrict(
    districtName: string,
    districts: District[]
  ): District | undefined {
    if (!districtName) return undefined;

    const exactMatch = districts.find(
      (d) => d.name.toLowerCase() === districtName.toLowerCase()
    );
    if (exactMatch) return exactMatch;

    const partialMatch = districts.find(
      (d) =>
        d.name.toLowerCase().includes(districtName.toLowerCase()) ||
        districtName.toLowerCase().includes(d.name.toLowerCase())
    );
    if (partialMatch) return partialMatch;

    const normalize = (str: string) =>
      str.toLowerCase().replace(/[^a-zäöüß]/g, '');

    const normalizedDistrictName = normalize(districtName);
    return districts.find((d) => normalize(d.name) === normalizedDistrictName);
  }
}
