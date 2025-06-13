import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
  `]
})
export class MapComponent implements OnInit, OnDestroy {
  @Input() districts: District[] = [];
  @Input() facilities: Facility[] = [];
  @Output() districtSelected = new EventEmitter<District>();

  private mapMannheim: any;
  private mapKaiserslautern: any;
  private isClient = false;

  mannheimDistricts: District[] = [];
  kaiserslauternDistricts: District[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
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
    // Mannheim Karte
    this.mapMannheim = L.map('map-mannheim').setView([49.4875, 8.4890], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.mapMannheim);

    // Kaiserslautern Karte
    this.mapKaiserslautern = L.map('map-kaiserslautern').setView([49.4447, 7.7689], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.mapKaiserslautern);

    this.addDistrictsToMaps();
    this.addFacilitiesToMaps();
  }

  private addDistrictsToMaps() {
    // Mannheim Stadtteile
    this.mannheimDistricts.forEach(district => {
      const circle = L.circle(district.coordinates, {
        color: '#333',
        fillColor: district.color,
        fillOpacity: 0.7,
        radius: 800,
        weight: 2
      }).addTo(this.mapMannheim);

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

    // Kaiserslautern Stadtteile
    this.kaiserslauternDistricts.forEach(district => {
      const circle = L.circle(district.coordinates, {
        color: '#333',
        fillColor: district.color,
        fillOpacity: 0.7,
        radius: 800,
        weight: 2
      }).addTo(this.mapKaiserslautern);

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
          html: `<div style="background: ${icon.color}; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${icon.symbol}</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
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
          html: `<div style="background: ${icon.color}; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${icon.symbol}</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
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
