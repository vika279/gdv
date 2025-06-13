import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
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
        <h3>Mannheim</h3>
        <div id="map-mannheim" class="map"></div>
        <div class="map-info">
          <p><strong>{{ mannheimDistricts.length }}</strong> Stadtteile</p>
          <p><strong>{{ getMannheimFacilities().length }}</strong> Einrichtungen</p>
        </div>
      </div>

      <div class="map-wrapper">
        <h3>Kaiserslautern</h3>
        <div id="map-kaiserslautern" class="map"></div>
        <div class="map-info">
          <p><strong>{{ kaiserslauternDistricts.length }}</strong> Stadtteile</p>
          <p><strong>{{ getKaiserslauternFacilities().length }}</strong> Einrichtungen</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .maps-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 25px;
      min-height: 500px;
    }

    @media (max-width: 1024px) {
      .maps-container {
        grid-template-columns: 1fr;
        gap: 20px;
      }
    }

    .map-wrapper {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      border: 2px solid #e9ecef;
    }

    .map-wrapper h3 {
      margin: 0 0 15px 0;
      color: #495057;
      font-weight: 600;
      text-align: center;
      font-size: 1.4rem;
    }

    .map {
      height: 400px;
      border-radius: 8px;
      border: 1px solid #dee2e6;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .map-info {
      margin-top: 12px;
      padding: 12px;
      background: white;
      border-radius: 6px;
      display: flex;
      justify-content: space-around;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .map-info p {
      margin: 0;
      color: #6c757d;
      font-size: 0.9rem;
    }

    :host ::ng-deep .leaflet-popup-content-wrapper {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    :host ::ng-deep .leaflet-popup-content {
      margin: 12px 16px;
      line-height: 1.4;
    }

    :host ::ng-deep .district-popup h4 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 1.1rem;
    }

    :host ::ng-deep .district-popup .popup-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      font-size: 0.85rem;
      color: #666;
    }

    :host ::ng-deep .district-popup .popup-index {
      margin-top: 8px;
      padding: 4px 8px;
      background: #007bff;
      color: white;
      border-radius: 4px;
      text-align: center;
      font-weight: bold;
    }

    :host ::ng-deep .facility-popup h5 {
      margin: 0 0 4px 0;
      color: #333;
    }

    :host ::ng-deep .facility-popup .facility-type {
      color: #666;
      font-size: 0.85rem;
      text-transform: capitalize;
    }

    /* GeoJSON Polygon Styles */
    :host ::ng-deep .district-polygon {
      stroke: #333;
      stroke-width: 2;
      stroke-opacity: 0.8;
      fill-opacity: 0.6;
    }

    :host ::ng-deep .district-polygon:hover {
      fill-opacity: 0.8;
      stroke-width: 3;
    }

    /* Deaktiviere Zoom-Kontrollen visuell */
    :host ::ng-deep .leaflet-control-zoom {
      display: none !important;
    }

    :host ::ng-deep .leaflet-container {
      cursor: default !important;
    }
  `]
})
export class MapComponent implements OnInit, OnDestroy {
  @Input() districts: District[] = [];
  @Input() facilities: Facility[] = [];
  @Output() districtSelected = new EventEmitter<District>();

  private mapMannheim: any;
  private mapKaiserslautern: any;
  private isClient = false;
  private geoJsonLayers: any[] = [];
  private geoJsonLoaded = { mannheim: false, kaiserslautern: false };

  mannheimDistricts: District[] = [];
  kaiserslauternDistricts: District[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) {
    this.isClient = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.mannheimDistricts = this.districts.filter(d => d.city === 'Mannheim');
    this.kaiserslauternDistricts = this.districts.filter(d => d.city === 'Kaiserslautern');

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

  getMannheimFacilities(): Facility[] {
    return this.facilities.filter(f =>
      this.mannheimDistricts.some(d => d.id === f.district)
    );
  }

  getKaiserslauternFacilities(): Facility[] {
    return this.facilities.filter(f =>
      this.kaiserslauternDistricts.some(d => d.id === f.district)
    );
  }

  private loadLeaflet() {
    if (typeof L === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      script.onload = () => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
        document.head.appendChild(link);
        setTimeout(() => this.initMaps(), 100);
      };
      document.head.appendChild(script);
    } else {
      this.initMaps();
    }
  }

  private initMaps() {
    // Statische Konfiguration für beide Karten
    const staticMapOptions = {
      zoomControl: false,      // Zoom-Buttons deaktivieren
      doubleClickZoom: false,  // Doppelklick-Zoom deaktivieren
      scrollWheelZoom: false,  // Mausrad-Zoom deaktivieren
      boxZoom: false,          // Box-Zoom deaktivieren
      keyboard: false,         // Tastatur-Navigation deaktivieren
      dragging: false,         // Verschieben deaktivieren
      touchZoom: false,        // Touch-Zoom deaktivieren
      attributionControl: true // Attribution beibehalten
    };

    // Mannheim Karte - größere Ansicht (niedrigerer Zoom-Level)
    this.mapMannheim = L.map('map-mannheim', staticMapOptions).setView([49.4875, 8.4890], 9);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      opacity: 0.2
    }).addTo(this.mapMannheim);

    // Kaiserslautern Karte - normale Ansicht
    this.mapKaiserslautern = L.map('map-kaiserslautern', staticMapOptions).setView([49.4447, 7.7689], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      opacity: 0.2
    }).addTo(this.mapKaiserslautern);

    // GeoJSON laden und dann Districts und Facilities hinzufügen
    this.loadGeoJsonData();
    this.addFacilitiesToMaps();
  }

  private addCirclesForCity(cityName: string) {
    const districts = cityName === 'Mannheim' ? this.mannheimDistricts : this.kaiserslauternDistricts;
    const map = cityName === 'Mannheim' ? this.mapMannheim : this.mapKaiserslautern;

    districts.forEach(district => {
      const circle = L.circle(district.coordinates, {
        color: '#333',
        fillColor: district.color,
        fillOpacity: 0.7,
        radius: 800,
        weight: 2
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
        this.districtSelected.emit(district);
      });
    });

    // Automatisches Anpassen der Ansicht für alle Stadtteile
    if (districts.length > 0) {
      const group = new L.featureGroup(districts.map(d => L.circle(d.coordinates, { radius: 800 })));

      // Unterschiedliche Zoom-Einstellungen für die Städte
      const zoomSettings = cityName === 'Mannheim'
        ? { padding: [50, 50], maxZoom: 10 }  // Größere Ansicht für Mannheim
        : { padding: [20, 20], maxZoom: 12 }; // Normale Ansicht für Kaiserslautern

      map.fitBounds(group.getBounds(), zoomSettings);
    }
  }

  private loadGeoJsonData() {
    // Kaiserslautern GeoJSON laden
    this.http.get('assets/data/KA_map.geojson').subscribe({
      next: (geoJsonData: any) => {
        this.addGeoJsonToMap(geoJsonData, this.mapKaiserslautern, 'Kaiserslautern');
        this.geoJsonLoaded.kaiserslautern = true;
      },
      error: (error) => {
        console.error('Fehler beim Laden der Kaiserslautern GeoJSON:', error);
        this.geoJsonLoaded.kaiserslautern = false;
        this.addCirclesForCity('Kaiserslautern');
      }
    });

    // Mannheim GeoJSON laden (falls vorhanden)
    this.http.get('assets/data/MA_map.geojson').subscribe({
      next: (geoJsonData: any) => {
        this.addGeoJsonToMap(geoJsonData, this.mapMannheim, 'Mannheim');
        this.geoJsonLoaded.mannheim = true;
      },
      error: (error) => {
        console.warn('Mannheim GeoJSON nicht gefunden:', error);
        this.geoJsonLoaded.mannheim = false;
        this.addCirclesForCity('Mannheim');
      }
    });
  }

  private addGeoJsonToMap(geoJsonData: any, map: any, cityName: string) {
    const districts = cityName === 'Mannheim' ? this.mannheimDistricts : this.kaiserslauternDistricts;

    const geoJsonLayer = L.geoJSON(geoJsonData, {
      style: (feature: any) => {
        const districtName = this.getDistrictNameFromFeature(feature, cityName);
        const district = this.findMatchingDistrict(districtName, districts);

        return {
          fillColor: district?.color || '#3388ff',
          weight: 2,
          opacity: 1.0,
          color: '#333',
          fillOpacity: 1.0,
          className: 'district-polygon'
        };
      },
      onEachFeature: (feature: any, layer: any) => {
        const districtName = this.getDistrictNameFromFeature(feature, cityName);
        const district = this.findMatchingDistrict(districtName, districts);

        if (district) {
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

          layer.bindPopup(popupContent);
          layer.on('click', () => {
            this.districtSelected.emit(district);
          });
        } else {
          const popupContent = `
            <div class="district-popup">
              <h4>${districtName || 'Unbekannter Stadtteil'}</h4>
              <p>Keine Daten verfügbar</p>
            </div>
          `;
          layer.bindPopup(popupContent);
        }

        // Hover-Effekte
        layer.on({
          mouseover: (e: any) => {
            const layer = e.target;
            layer.setStyle({
              fillOpacity: 0.8,
              weight: 3
            });
          },
          mouseout: (e: any) => {
            const layer = e.target;
            layer.setStyle({
              fillOpacity: 1.0,
              weight: 2
            });
          }
        });
      }
    }).addTo(map);

    this.geoJsonLayers.push(geoJsonLayer);

    // Karte automatisch an GeoJSON-Grenzen anpassen
    if (geoJsonData.features && geoJsonData.features.length > 0) {
      // Unterschiedliche Zoom-Einstellungen für die Städte
      const zoomSettings = cityName === 'Mannheim'
        ? { padding: [50, 50], maxZoom: 10 }  // Größere Ansicht für Mannheim
        : { padding: [20, 20], maxZoom: 12 }; // Normale Ansicht für Kaiserslautern

      map.fitBounds(geoJsonLayer.getBounds(), zoomSettings);
    }
  }

  // Hilfsfunktion: Extrahiert den Namen aus dem GeoJSON-Feature
  private getDistrictNameFromFeature(feature: any, cityName: string): string {
    if (cityName === 'Kaiserslautern') {
      return feature.properties.PGIS_TXT || '';
    } else {
      return feature.properties.name || '';
    }
  }

  // Hilfsfunktion: Findet den passenden District mit robustem Matching
  private findMatchingDistrict(districtName: string, districts: District[]): District | undefined {
    if (!districtName) return undefined;

    // 1. Versuch: Exakte Übereinstimmung (ignoriere Groß-/Kleinschreibung)
    const exactMatch = districts.find(d =>
      d.name.toLowerCase() === districtName.toLowerCase()
    );
    if (exactMatch) return exactMatch;

    // 2. Versuch: Teilübereinstimmung in beide Richtungen
    const partialMatch = districts.find(d =>
      d.name.toLowerCase().includes(districtName.toLowerCase()) ||
      districtName.toLowerCase().includes(d.name.toLowerCase())
    );
    if (partialMatch) return partialMatch;

    // 3. Versuch: Normalisierte Übereinstimmung (entferne Sonderzeichen)
    const normalize = (str: string) =>
      str.toLowerCase().replace(/[^a-zäöüß]/g, '');

    const normalizedDistrictName = normalize(districtName);
    return districts.find(d =>
      normalize(d.name) === normalizedDistrictName
    );
  }

  private addDistrictsToMaps() {
    // Diese Methode wird nicht mehr verwendet, da wir die Circles in addCirclesForCity() hinzufügen
  }

  private addFacilitiesToMaps() {
    const facilityIcons = {
      kita: { color: '#28a745', symbol: '🏠' },
      grundschule: { color: '#007bff', symbol: '🏫' },
      kinderarzt: { color: '#dc3545', symbol: '⚕️' },
      spielplatz: { color: '#ffc107', symbol: '🛝' }
    };

    // Mannheim Einrichtungen
    this.getMannheimFacilities().forEach(facility => {
      const icon = facilityIcons[facility.type];
      const marker = L.marker(facility.coordinates, {
        icon: L.divIcon({
          html: `<div style="background: ${icon.color}; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${icon.symbol}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          className: 'custom-marker'
        })
      }).addTo(this.mapMannheim);

      const popupContent = `
        <div class="facility-popup">
          <h5>${facility.name}</h5>
          <div class="facility-type">${this.getFacilityTypeLabel(facility.type)}</div>
        </div>
      `;

      marker.bindPopup(popupContent);
    });

    // Kaiserslautern Einrichtungen
    this.getKaiserslauternFacilities().forEach(facility => {
      const icon = facilityIcons[facility.type];
      const marker = L.marker(facility.coordinates, {
        icon: L.divIcon({
          html: `<div style="background: ${icon.color}; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${icon.symbol}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          className: 'custom-marker'
        })
      }).addTo(this.mapKaiserslautern);

      const popupContent = `
        <div class="facility-popup">
          <h5>${facility.name}</h5>
          <div class="facility-type">${this.getFacilityTypeLabel(facility.type)}</div>
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
      spielplatz: 'Spielplatz'
    };
    return labels[type as keyof typeof labels] || type;
  }
}
