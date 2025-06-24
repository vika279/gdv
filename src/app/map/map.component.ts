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
            <option value="">Wählen Sie ein Stadtbezirk</option>
            <option value="gesamt">Gesamt</option>
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
              {{ getMannheimAverageRating() }}/5
            </div>
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

      <div class="map-wrapper">
        <div class="map-header">
          <h3>Kaiserslautern</h3>
          <select
            class="district-select"
            [value]="selectedKaiserslauternDistrict"
            (change)="onDistrictChange($event, 'kaiserslautern')"
          >
            <option value="">Wählen Sie ein Stadtbezirk</option>
            <option value="gesamt">Gesamt</option>
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
              {{ getKaiserslauternAverageRating() }}/5
            </div>
          </div>
        </div>
        <div class="legend">
          <div class="legend-title">Kinderfreundlichkeit</div>
          <div class="legend-scale">
            <div class="legend-item" *ngFor="let item of kaiserslauternLegend">
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
  `,
  styles: [
    `
      .maps-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
        min-height: 1000px;
        align-items: start;
      }

      @media (max-width: 1024px) {
        .maps-container {
          grid-template-columns: 1fr;
          gap: 30px;
        }
      }

      .map-wrapper {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .map-header {
        padding: 20px 20px 10px 20px;
       // border-bottom: 1px solid #e9ecef;
        display: flex;
        gap: 40px;
      }

      .map-header h3 {
        margin: 0 0 15px 0;
        color: #333;
        font-weight: 700;
        font-size: 1.5rem;
      }

      .district-select {
        width: 100%;
        padding: 10px 15px;
        border: 2px solid #e9ecef;
        border-radius: 8px;
        background: white;
        font-size: 0.9rem;
        color: #666;
        cursor: pointer;
        transition: border-color 0.2s;
      }

      .district-select:focus {
        outline: none;
        border-color: #007bff;
      }

      .map-container {
        position: relative;
        height: 500px;
        flex: 1;
      }

      .map {
        height: 100%;
        width: 100%;
      }

      .map-overlay {
        position: absolute;
        top: 20px;
        right: 20px;
        z-index: 1000;
      }

      .rating-badge {
        background: white;
        padding: 16px 14px;
        border-radius: 40px;
        font-weight: bold;
        font-size: 1.1rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        color: white;
      }

      .mannheim-rating {
        background: #dc3545;
      }

      .kaiserslautern-rating {
        background: #007bff;
      }

      .legend {
        padding: 20px;
        border-top: 1px solid #e9ecef;
      }

      .legend-title {
        font-weight: 600;
        font-size: 0.9rem;
        color: #333;
        margin-bottom: 10px;
        text-align: right;
      }

      .legend-scale {
        display: flex;
        justify-content: end;
        align-items: right;
      }

      .legend-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 0.8rem;
        color: #666;
      }

      .legend-color {
        width: 20px;
        height: 20px;
        border-radius: 2px;
        margin-bottom: 4px;
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      /* Leaflet Overrides */
      :host ::ng-deep .leaflet-popup-content-wrapper {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

      :host ::ng-deep .district-popup .popup-index {
        padding: 6px 12px;
        background: linear-gradient(135deg, #007bff, #0056b3);
        color: white;
        border-radius: 6px;
        text-align: center;
        font-weight: bold;
        font-size: 0.9rem;
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
        outline-offset: 1px;
        // height: 100% !important;
        // width: 100% !important;
      }

      :host ::ng-deep .leaflet-control-attribution {
        font-size: 10px !important;
        background: rgba(255, 255, 255, 0.8) !important;
      }

      /* Polygon-Styles */
      :host ::ng-deep .district-polygon {
        transition: all 0.2s ease;
      }

      :host ::ng-deep .district-polygon:hover {
        fill-opacity: 0.9 !important;
        stroke-width: 3 !important;
      }

      /* Transparenz-Styles für nicht-ausgewählte Bezirke */
      :host ::ng-deep .district-polygon-faded {
        fill-opacity: 0.3 !important;
        transition: all 0.3s ease;
      }

      :host ::ng-deep .district-polygon-selected {
        fill-opacity: 0.9 !important;
        stroke-width: 3 !important;
        transition: all 0.3s ease;
      }

      /* Custom Marker Styles */
      :host ::ng-deep .custom-marker {
        transition: transform 0.2s ease;
      }

      :host ::ng-deep .custom-marker:hover {
        transform: scale(1.1);
      }
      #map-mannheim {
  // transform: scale(1.25);
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
    { value: 1, color: '#add8e6' },
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
  }

  onDistrictChange(event: any, city: string) {
    const districtId = event.target.value;

    // ÄNDERUNG: Verwende event.target.selectedOptions[0].text anstatt districtId
    if (districtId === 'gesamt') {
      this.resetAllDistrictsVisibility(city);
      if (city === 'mannheim') {
        this.selectedMannheimDistrict = 'gesamt';
      } else {
        this.selectedKaiserslauternDistrict = 'gesamt';
      }
    } else if (districtId) {
      const districts =
        city === 'mannheim'
          ? this.mannheimDistricts
          : this.kaiserslauternDistricts;
      const selectedDistrict = districts.find((d) => d.id === districtId);

      if (selectedDistrict) {
        this.selectDistrict(selectedDistrict, city);
      }
    } else {
      this.resetAllDistrictsVisibility(city);
      if (city === 'mannheim') {
        this.selectedMannheimDistrict = '';
      } else {
        this.selectedKaiserslauternDistrict = '';
      }
    }
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
    // ÄNDERUNG: Beide Karten gleichzeitig behandeln

    // Mannheim Karte
    if (this.mannheimGeoJsonLayer) {
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
          if (
            city === 'mannheim' &&
            matchingDistrict.id === selectedDistrictId
          ) {
            // Ausgewählter Bezirk in Mannheim
            featureLayer.setStyle({
              fillOpacity: 0.9,
              weight: 3,
              className: 'district-polygon-selected',
            });
          } else {
            // Alle anderen Bezirke in Mannheim - transparent
            featureLayer.setStyle({
              fillOpacity: 0.3,
              weight: 1,
              className: 'district-polygon-faded',
            });
          }
        }
      });
    }

    // Kaiserslautern Karte
    if (this.kaiserslauternGeoJsonLayer) {
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
          if (
            city === 'kaiserslautern' &&
            matchingDistrict.id === selectedDistrictId
          ) {
            // Ausgewählter Bezirk in Kaiserslautern
            featureLayer.setStyle({
              fillOpacity: 0.9,
              weight: 3,
              className: 'district-polygon-selected',
            });
          } else {
            // Alle anderen Bezirke in Kaiserslautern - transparent
            featureLayer.setStyle({
              fillOpacity: 0.3,
              weight: 1,
              className: 'district-polygon-faded',
            });
          }
        }
      });
    }
  }

  // 4. RESET-FUNKTION FIX - Ändere resetAllDistrictsVisibility():
  private resetAllDistrictsVisibility(city: string) {
    // ÄNDERUNG: Beide Karten zurücksetzen, nicht nur die ausgewählte Stadt

    // Mannheim zurücksetzen
    if (this.mannheimGeoJsonLayer) {
      this.mannheimGeoJsonLayer.eachLayer((featureLayer: any) => {
        featureLayer.setStyle({
          fillOpacity: 0.8,
          weight: 2,
          className: 'district-polygon',
        });
      });
    }

    // Kaiserslautern zurücksetzen
    if (this.kaiserslauternGeoJsonLayer) {
      this.kaiserslauternGeoJsonLayer.eachLayer((featureLayer: any) => {
        featureLayer.setStyle({
          fillOpacity: 0.8,
          weight: 2,
          className: 'district-polygon',
        });
      });
    }

    // Dropdown-Werte zurücksetzen
    if (city === 'mannheim') {
      this.selectedMannheimDistrict = '';
    } else {
      this.selectedKaiserslauternDistrict = '';
    }
  }

  getMannheimAverageRating(): number {
    if (this.mannheimDistricts.length === 0) return 0;
    const sum = this.mannheimDistricts.reduce(
      (acc, district) => acc + district.index,
      0
    );
    return Math.round(sum / this.mannheimDistricts.length);
  }

  getKaiserslauternAverageRating(): number {
    if (this.kaiserslauternDistricts.length === 0) return 0;
    const sum = this.kaiserslauternDistricts.reduce(
      (acc, district) => acc + district.index,
      0
    );
    return Math.round(sum / this.kaiserslauternDistricts.length);
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
    attributionControl: true,
  };

  // MANNHEIM - Mit größeren Bounds (zeigt mehr Gebiet = kleiner wirkend)
  this.mapMannheim = L.map('map-mannheim', staticMapOptions);

  // Größerer Bereich um Mannheim (macht Karte "kleiner")
  const mannheimBounds = L.latLngBounds(
    [49.43, 8.42],  // Südwest
    [49.54, 8.56]   // Nordost
  );
  this.mapMannheim.fitBounds(mannheimBounds);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    opacity: 0.0,
  }).addTo(this.mapMannheim);

  // KAISERSLAUTERN - Normaler Zoom
  this.mapKaiserslautern = L.map('map-kaiserslautern', staticMapOptions)
    .setView([49.4447, 7.7689], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    opacity: 0.0,
  }).addTo(this.mapKaiserslautern);

  this.loadGeoJsonData();
}

  private addCirclesForCity(cityName: string) {
    const districts =
      cityName === 'Mannheim'
        ? this.mannheimDistricts
        : this.kaiserslauternDistricts;
    const map =
      cityName === 'Mannheim' ? this.mapMannheim : this.mapKaiserslautern;

    districts.forEach((district) => {
      const circle = L.circle(district.coordinates, {
        color: '#ffffff',
        fillColor: district.color,
        fillOpacity: 0.8,
        radius: 800,
        weight: 2,
      }).addTo(map);

      const popupContent = `
        <div class="district-popup">
          <h4>${district.name}</h4>
          <div class="popup-stats">
            <div>Kitas: ${district.kitas}</div>
            <div>Schulen: ${district.grundschulen}</div>
            <div>Kinderärzte: ${district.kinderaerzte}</div>
            <div>Spielplätze: ${district.spielplaetze}</div>
            <div>Kinderanteil: ${district.kinderanteil}%</div>
          </div>
          <div class="popup-index">Index: ${district.index}/5</div>
        </div>
      `;

      circle.bindPopup(popupContent);
      circle.on('click', () => {
        this.selectDistrict(
          district,
          cityName === 'Mannheim' ? 'mannheim' : 'kaiserslautern'
        );
      });
    });
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
        this.addCirclesForCity('Kaiserslautern');
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
        this.addCirclesForCity('Mannheim');
      },
    });
  }

  private addGeoJsonToMap(geoJsonData: any, map: any, cityName: string) {
    const districts =
      cityName === 'Mannheim'
        ? this.mannheimDistricts
        : this.kaiserslauternDistricts;

    // Heatmap-Daten
    const mannheimHeatmapData: { [key: string]: number } = {
      'Innenstadt/Jungbusch': 4,
      'Neckarstadt-West': 5,
      Lindenhof: 2,
      Schönau: 4,
      Sandhofen: 2,
      Neckarau: 2,
      Waldhof: 4,
      'Neckarstadt-Ost': 5,
      'Schwetzingerstadt/Oststadt': 3,
      'Neuostheim/Neuhermsheim': 2,
      Rheinau: 3,
      Käfertal: 3,
      Vogelstang: 2,
      Feudenheim: 2,
      Seckenheim: 3,
      Wallstadt: 1,
      Friedrichsfeld: 1,
    };

    const kaiserslauternHeatmapData: { [key: string]: number } = {
      Dansenberg: 2,
      Erfenbach: 3,
      Erlenbach: 2,
      'Erzhütten/Wiesenthalerhof': 1,
      Hohenecken: 3,
      Morlautern: 2,
      Einsiedlerhof: 4,
      Mölschbach: 2,
      Siegelbach: 3,
      'Innenstadt-Ost': 5,
      'Innenstadt-Südwest': 4,
      'Innenstadt West/Kotten': 4,
      'Innenstadt Nord/Kaiserberg': 3,
      'Grübentälchen/Volkspark': 2,
      Betzenberg: 4,
      'Lämmchesberg/Uniwohnstadt': 5,
      'Bännjerrück\/Karl-Pfaff-S.`': 3,
      'Kaiserslautern-West': 4,
    };

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
          1: '#add8e6',
        };
        return colorMap[value] || '#cccccc';
      }
      return '#cccccc';
    };

    const geoJsonLayer = L.geoJSON(geoJsonData, {
      style: (feature: any) => {
        const districtName = this.getDistrictNameFromFeature(feature, cityName);
        let fillColor: string;

        if (cityName === 'Mannheim') {
          const heatmapValue = mannheimHeatmapData[districtName] || 0;
          fillColor =
            heatmapValue > 0
              ? getHeatmapColor(heatmapValue, cityName)
              : '#cccccc';
        } else if (cityName === 'Kaiserslautern') {
          const heatmapValue = kaiserslauternHeatmapData[districtName] || 0;
          fillColor =
            heatmapValue > 0
              ? getHeatmapColor(heatmapValue, cityName)
              : '#cccccc';
        } else {
          fillColor = '#cccccc';
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
          const heatmapValue =
            cityName === 'Mannheim'
              ? mannheimHeatmapData[districtName] || 0
              : cityName === 'Kaiserslautern'
              ? kaiserslauternHeatmapData[districtName] || 0
              : 0;

          const popupContent = `
            <div class="district-popup">
              <h4>${district.name}</h4>
              ${
                (cityName === 'Mannheim' || cityName === 'Kaiserslautern') &&
                heatmapValue > 0
                  ? `<div class="heatmap-value"><strong>Bewertung: ${heatmapValue}/5</strong></div>`
                  : ''
              }
              <div class="popup-stats">
                <div>Kitas: ${district.kitas}</div>
                <div>Schulen: ${district.grundschulen}</div>
                <div>Kinderärzte: ${district.kinderaerzte}</div>
                <div>Spielplätze: ${district.spielplaetze}</div>
                <div>Kinderanteil: ${district.kinderanteil}%</div>
              </div>
              <div class="popup-index">Index: ${district.index}/5</div>
            </div>
          `;
          layer.bindPopup(popupContent);
          layer.on('click', () => {
            this.selectDistrict(
              district,
              cityName === 'Mannheim' ? 'mannheim' : 'kaiserslautern'
            );
          });
        }

        // Hover-Effekte
        layer.on({
          mouseover: (e: any) => {
            const layer = e.target;
            layer.setStyle({
              fillOpacity: 0.9,
              weight: 3,
              color: '#ffffff',
            });
          },
          mouseout: (e: any) => {
            const layer = e.target;
            const districtName = this.getDistrictNameFromFeature(
              layer.feature,
              cityName
            );
            const district = this.findMatchingDistrict(districtName, districts);

            // ÄNDERUNG: Bessere Logik für Auswahl-Status
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
              color: '#ffffff',
            });
          },
        });
      },
    }).addTo(map);

    // Store the layer reference for the specific city
    if (cityName === 'Mannheim') {
      this.mannheimGeoJsonLayer = geoJsonLayer;
    } else {
      this.kaiserslauternGeoJsonLayer = geoJsonLayer;
    }

    // Karte statisch anpassen - kein Zoom
    if (geoJsonData.features && geoJsonData.features.length > 0) {
      const bounds = geoJsonLayer.getBounds();
      const center = bounds.getCenter();
      map.setView(center, map.getZoom()); // Behält aktuelle Zoomstufe bei
    }
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

  private addFacilitiesToMaps() {
    const facilityIcons = {
      kita: { color: '#28a745', symbol: '🏠' },
      grundschule: { color: '#007bff', symbol: '🏫' },
      kinderarzt: { color: '#dc3545', symbol: '⚕️' },
      spielplatz: { color: '#ffc107', symbol: '🛝' },
    };

    // Mannheim Einrichtungen
    this.getMannheimFacilities().forEach((facility) => {
      const icon = facilityIcons[facility.type];
      const marker = L.marker(facility.coordinates, {
        icon: L.divIcon({
          html: `<div style="background: ${icon.color}; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">${icon.symbol}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          className: 'custom-marker',
        }),
      }).addTo(this.mapMannheim);

      const popupContent = `
        <div class="facility-popup">
          <h5>${facility.name}</h5>
          <div class="facility-type">${this.getFacilityTypeLabel(
            facility.type
          )}</div>
        </div>
      `;

      marker.bindPopup(popupContent);
    });

    // Kaiserslautern Einrichtungen
    this.getKaiserslauternFacilities().forEach((facility) => {
      const icon = facilityIcons[facility.type];
      const marker = L.marker(facility.coordinates, {
        icon: L.divIcon({
          html: `<div style="background: ${icon.color}; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">${icon.symbol}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          className: 'custom-marker',
        }),
      }).addTo(this.mapKaiserslautern);

      const popupContent = `
        <div class="facility-popup">
          <h5>${facility.name}</h5>
          <div class="facility-type">${this.getFacilityTypeLabel(
            facility.type
          )}</div>
        </div>
      `;

      marker.bindPopup(popupContent);
    });
  }

  private getFacilityTypeLabel(type: string): string {
    const labels = {
      kita: 'Kindertagesstätte',
      grundschule: 'Grundschule',
      kinderarzt: 'Kinderarzt',
      spielplatz: 'Spielplatz',
    };
    return labels[type as keyof typeof labels] || type;
  }
}
