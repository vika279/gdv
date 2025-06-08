import { Component, AfterViewInit, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  imports: []
})
export class MapComponent implements OnInit {
   @ViewChild('mapElement', { static: true }) mapElement!: ElementRef;

  private map!: L.Map;
  private geoJsonLayer!: L.GeoJSON;
  private labelsGroup!: L.LayerGroup;
  public showLabels = true;
  private bounds!: L.LatLngBounds;

  ngOnInit() {
    // Warte bis View initialisiert ist
    setTimeout(() => {
      this.initVectorMap();
      this.loadStadtteileGeoJSON();
    }, 100);
  }

  private initVectorMap(): void {
    try {
      // Prüfe ob Element existiert
      if (!this.mapElement?.nativeElement) {
        console.error('Map element not found');
        return;
      }

      // Karte ohne Hintergrund-Tiles initialisieren
      this.map = L.map(this.mapElement.nativeElement, {
        center: [49.444, 7.769], // Kaiserslautern - gültige Koordinaten
        zoom: 11,
        minZoom: 8,
        maxZoom: 16,
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true // Bessere Performance für Vektordaten
      });

      // Labels-Gruppe für Stadtteil-Namen
      this.labelsGroup = L.layerGroup();

      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  private loadStadtteileGeoJSON(): void {
    // Für echte Daten - ersetze den Pfad mit deinem GeoJSON

    fetch('assets/data/MA_map.geojson')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('GeoJSON loaded:', data);
        this.validateAndRenderGeoJSON(data);
      })
      .catch(error => {
        console.error('Error loading GeoJSON:', error);
        // this.loadExampleData(); // Fallback zu Beispieldaten
      });


    // Für Demo - verwende korrekte Beispieldaten
   // this.loadExampleData();
  }

  // private loadExampleData(): void {
  //   // Realistische Koordinaten für Kaiserslautern Stadtteile
  //   const exampleGeoJSON = {
  //     "type": "FeatureCollection",
  //     "features": [
  //       {
  //         "type": "Feature",
  //         "properties": {
  //           "name": "Innenstadt",
  //           "population": 5000,
  //           "area": 2.1
  //         },
  //         "geometry": {
  //           "type": "Polygon",
  //           "coordinates": [[
  //             [7.750, 49.440],
  //             [7.770, 49.440],
  //             [7.770, 49.450],
  //             [7.750, 49.450],
  //             [7.750, 49.440]
  //           ]]
  //         }
  //       },
  //       {
  //         "type": "Feature",
  //         "properties": {
  //           "name": "Westend",
  //           "population": 3500,
  //           "area": 1.8
  //         },
  //         "geometry": {
  //           "type": "Polygon",
  //           "coordinates": [[
  //             [7.740, 49.435],
  //             [7.755, 49.435],
  //             [7.755, 49.445],
  //             [7.740, 49.445],
  //             [7.740, 49.435]
  //           ]]
  //         }
  //       },
  //       {
  //         "type": "Feature",
  //         "properties": {
  //           "name": "Universitätsviertel",
  //           "population": 4200,
  //           "area": 3.2
  //         },
  //         "geometry": {
  //           "type": "Polygon",
  //           "coordinates": [[
  //             [7.765, 49.420],
  //             [7.785, 49.420],
  //             [7.785, 49.435],
  //             [7.765, 49.435],
  //             [7.765, 49.420]
  //           ]]
  //         }
  //       }
  //     ]
  //   };

  //   this.validateAndRenderGeoJSON(exampleGeoJSON);
  // }

  private validateAndRenderGeoJSON(geoJsonData: any): void {
    try {
      // Validiere GeoJSON Struktur
      if (!geoJsonData || !geoJsonData.features || !Array.isArray(geoJsonData.features)) {
        throw new Error('Invalid GeoJSON structure');
      }

      // Prüfe ob Features gültige Geometrien haben
      const validFeatures = geoJsonData.features.filter((feature: { geometry: { coordinates: any; }; }) => {
        if (!feature.geometry || !feature.geometry.coordinates) {
          console.warn('Feature ohne gültige Geometrie gefunden:', feature);
          return false;
        }
        return true;
      });

      if (validFeatures.length === 0) {
        throw new Error('Keine gültigen Features gefunden');
      }

      const cleanGeoJSON = {
        ...geoJsonData,
        features: validFeatures
      };

      console.log(`Rendering ${validFeatures.length} gültige Features`);
      this.renderVectorMap(cleanGeoJSON);

    } catch (error) {
      console.error('Error validating GeoJSON:', error);
    }
  }

  private renderVectorMap(geoJsonData: any): void {
    try {
      if (!this.map) {
        console.error('Map not initialized');
        return;
      }

      // Entferne vorherige Layer falls vorhanden
      if (this.geoJsonLayer) {
        this.map.removeLayer(this.geoJsonLayer);
      }

      this.geoJsonLayer = L.geoJSON(geoJsonData, {
        style: (feature) => this.getStadtteilStyle(feature),
        onEachFeature: (feature, layer) => this.onEachStadtteil(feature, layer)
      });

      // Layer zur Karte hinzufügen
      this.geoJsonLayer.addTo(this.map);

      // Bounds berechnen und Karte darauf zoomen
      const bounds = this.geoJsonLayer.getBounds();
      if (bounds.isValid()) {
        this.bounds = bounds;
        this.map.fitBounds(bounds, {
          padding: [20, 20],
          maxZoom: 14 // Verhindere zu starkes Hineinzoomen
        });

        // Labels nach dem Zoomen hinzufügen
        setTimeout(() => {
          this.addStadtteilLabels(geoJsonData);
          if (this.labelsGroup && this.showLabels) {
            this.labelsGroup.addTo(this.map);
          }
        }, 500);
      } else {
        console.error('Invalid bounds calculated from GeoJSON');
      }

    } catch (error) {
      console.error('Error rendering vector map:', error);
    }
  }

  private getStadtteilStyle(feature: any): L.PathOptions {
    // Verschiedene Farben basierend on Eigenschaften
    const population = feature?.properties?.population || 0;
    const color = this.getColorByPopulation(population);

    return {
      fillColor: color,
      weight: 2,
      opacity: 1,
      color: '#2c3e50',
      dashArray: '',
      fillOpacity: 0.4,
      className: 'stadtteil-polygon'
    };
  }

  private getColorByPopulation(population: number): string {
    // Farbskala basierend auf Einwohnerzahl
    if (population > 4000) return '#e74c3c';
    if (population > 3000) return '#f39c12';
    if (population > 2000) return '#f1c40f';
    return '#3498db';
  }

  private onEachStadtteil(feature: any, layer: L.Layer): void {
    const props = feature.properties;
    const popupContent = `
      <div style="font-family: Arial; padding: 5px;">
        <h4 style="margin: 0 0 10px 0;">${props.name}</h4>
        <p style="margin: 0;"><strong>Einwohner:</strong> ${props.population || 'N/A'}</p>
      </div>
    `;

    layer.bindPopup(popupContent);

    // Hover-Effekte
    layer.on({
      mouseover: (e) => {
        const target = e.target;
        target.setStyle({
          weight: 4,
          fillOpacity: 0.7
        });
      },
      mouseout: (e) => {
        this.geoJsonLayer.resetStyle(e.target);
      }
    });
  }

  private addStadtteilLabels(geoJsonData: any): void {
    try {
      // Entferne vorherige Labels
      if (this.labelsGroup) {
        this.labelsGroup.clearLayers();
      } else {
        this.labelsGroup = L.layerGroup();
      }

      geoJsonData.features.forEach((feature: any) => {
        if (feature.geometry && feature.geometry.type === 'Polygon' && feature.properties?.name) {
          try {
            // Berechne Zentrum des Polygons
            const coords = feature.geometry.coordinates[0];
            if (coords && coords.length > 0) {
              const center = this.getPolygonCenter(coords);

              // Validiere Koordinaten
              if (isFinite(center[0]) && isFinite(center[1])) {
                const label = L.divIcon({
                  html: `<span class="stadtteil-label">${feature.properties.name}</span>`,
                  className: 'custom-label',
                  iconSize: [120, 25],
                  iconAnchor: [60, 12]
                });

                const marker = L.marker([center[1], center[0]], { icon: label });
                this.labelsGroup.addLayer(marker);
              }
            }
          } catch (labelError) {
            console.warn('Error creating label for feature:', feature.properties?.name, labelError);
          }
        }
      });

      console.log(`Added ${this.labelsGroup.getLayers().length} labels`);
    } catch (error) {
      console.error('Error adding labels:', error);
    }
  }

  private getPolygonCenter(coordinates: number[][]): number[] {
    try {
      let x = 0, y = 0, count = 0;

      coordinates.forEach(coord => {
        if (Array.isArray(coord) && coord.length >= 2 && isFinite(coord[0]) && isFinite(coord[1])) {
          x += coord[0];
          y += coord[1];
          count++;
        }
      });

      if (count === 0) {
        throw new Error('No valid coordinates found');
      }

      return [x / count, y / count];
    } catch (error) {
      console.error('Error calculating polygon center:', error);
      return [7.769, 49.444]; // Fallback zu Kaiserslautern Zentrum
    }
  }

  public resetView(): void {
    try {
      if (this.bounds && this.bounds.isValid() && this.map) {
        this.map.fitBounds(this.bounds, {
          padding: [20, 20],
          maxZoom: 14
        });
      } else if (this.map) {
        // Fallback zu Kaiserslautern Zentrum
        this.map.setView([49.444, 7.769], 11);
      }
    } catch (error) {
      console.error('Error resetting view:', error);
    }
  }

  public toggleLabels(): void {
    try {
      this.showLabels = !this.showLabels;
      if (!this.labelsGroup || !this.map) return;

      if (this.showLabels) {
        this.labelsGroup.addTo(this.map);
      } else {
        this.map.removeLayer(this.labelsGroup);
      }
    } catch (error) {
      console.error('Error toggling labels:', error);
    }
  }
}
