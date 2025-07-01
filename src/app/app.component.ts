import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './map/map.component';
import { RadarChartComponent } from './radar-chart/radar-chart.component';
import { ComparisonTableComponent } from './comparison-table/comparison-table.component';
import { ComparisonCardsComponent } from './comparison-cards/comparison-cards.component';

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
  // Additional properties from CSV
  kitasIndex: number;
  grundschulenIndex: number;
  kinderaerzteIndex: number;
  spielplaetzeIndex: number;
  gesamt_kinder: number;
  kinder_0_6: number;
  kinder_6_10: number;
  kinder_0_10: number;
  kinderanteilIndex: number;
  gesamt_Einwohner: number;
  avg_index: number;
  kinder_grundschule: number;
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
  imports: [
    CommonModule,
    MapComponent,
    RadarChartComponent,
    ComparisonTableComponent,
    ComparisonCardsComponent,
  ],
  template: `
    <div class="app-container">
      <header class="header">
        <!-- <h1>Kinderfreundlichkeits-Vergleich: Mannheim vs. Kaiserslautern</h1>
        <p class="subtitle">Interaktive Analyse kindgerechter Infrastruktur für Kinder im Alter von 0-10 Jahren</p> -->
      </header>

      <div class="comparison-content">
        <!-- Radar Chart -->
        <div class="chart-container">
          <h2>Detailvergleich</h2>
          <!-- <h3>Indikator-Vergleich</h3> -->
          <app-radar-chart
            [mannheimDistrict]="selectedMannheim"
            [kaiserslauternDistrict]="selectedKaiserslautern"
          >
          </app-radar-chart>
        </div>

        <!-- Vergleichstabelle -->
        <div class="table-container">
          <app-comparison-table
            [mannheimDistrict]="selectedMannheim"
            [kaiserslauternDistrict]="selectedKaiserslautern"
          >
          </app-comparison-table>
        </div>
      </div>
      <!-- </div> -->

      <div class="main-content">
        <!-- Karten-Vergleich -->
        <div class="maps-section">
          <!-- <h2>Stadtvergleich</h2> -->

          <app-map
            [districts]="districts"
            (districtSelected)="onDistrictSelected($event)"
          >
          </app-map>
        </div>
        <app-comparison-cards
          [mannheimDistrict]="selectedMannheim"
          [kaiserslauternDistrict]="selectedKaiserslautern"
        >
        </app-comparison-cards>
      </div>

      <!-- Loading indicator -->
      <div *ngIf="isLoading" class="loading">
        <p>Lade Daten...</p>
      </div>

      <!-- Error message -->
      <div *ngIf="errorMessage" class="error">
        <p>{{ errorMessage }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      .app-container {
        display: flex;
        width: 100vw;
        min-height: 100vh;
        padding: 1.5rem;
        box-sizing: border-box;
      }

      .comparison-content {
        flex: 1;
        width: 100%;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        margin-right: 30px;
        .chart-container {
          margin-bottom: 2rem;
          width: 100%;
          h2 {
            margin-left: 3rem;
            font-weight: 700;
            font-size: clamp(1.2rem, 2vw, 1.5rem);
          }
        }
      }

      .main-content {
        flex: 2.5;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .maps-section {
        flex: 1;
        width: 100%;
        height: 60vh;
        min-height: 400px;
        background: white;
        border-radius: 12px;

        ::ng-deep {
          .map-container {
            width: 100%;
            height: 100%;
          }

          .leaflet-container {
            width: 100%;
            height: 100%;
          }
        }
      }

      .selected-districts {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
        width: 100%;
      }

      .selected-district {
        flex: 1;
        min-width: 250px;
        padding: 15px 20px;
        border-radius: 8px;
        font-size: 0.95rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.3s ease;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        width: 100%;
      }

      .index {
        font-weight: bold;
        padding: 6px 12px;
        border-radius: 15px;
        font-size: 0.85rem;
      }

      .mannheim .index {
        background: rgba(102, 126, 234, 0.2);
        color: #667eea;
      }

      .kaiserslautern .index {
        background: rgba(240, 147, 251, 0.2);
        color: #f093fb;
      }

      /* Responsive Design */
      @media (max-width: 1200px) {
        .app-container {
          flex-direction: column;
          height: auto;
          padding: 1rem;
          overflow-x: hidden;
        }

        .comparison-content,
        .main-content {
          width: 100%;
          margin: 0;
        }

        .maps-section {
          height: 50vh;
          min-height: 350px;
        }
      }

      @media (max-width: 768px) {
        .app-container {
          padding: 0.5rem;
          gap: 15px;
        }

        .maps-section {
          height: 40vh;
          min-height: 300px;
        }

        .selected-district {
          min-width: 200px;
          padding: 12px 15px;
        }
      }

      @media (max-width: 480px) {
        .app-container {
          padding: 0.25rem;
          gap: 10px;
        }

        .maps-section {
          height: 35vh;
          min-height: 250px;
        }

        .selected-district {
          min-width: 150px;
          padding: 10px;
          font-size: 0.9rem;
        }
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  selectedMannheim: District | null = null;
  selectedKaiserslautern: District | null = null;
  districts: District[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  defaultMannheimDistrict: District | null = null;
  defaultKaiserslauternDistrict: District | null = null;

  // Approximate coordinates for districts (you may want to adjust these)
  private readonly districtCoordinates: { [key: string]: [number, number] } = {
    // Kaiserslautern districts
    Betzenberg: [49.4386, 7.7589],
    'Bännjerrück/Karl-Pfaff-S.': [49.45, 7.74],
    Dansenberg: [49.47, 7.73],
    Einsiedlerhof: [49.42, 7.78],
    Erfenbach: [49.46, 7.8],
    Erlenbach: [49.43, 7.72],
    'Erzhütten/Wiesenthalerhof': [49.41, 7.76],
    'Grübentälchen/Volkspark': [49.445, 7.765],
    Hohenecken: [49.48, 7.71],
    'Innenstadt-Nord/Kaiserberg': [49.45, 7.77],
    'Innenstadt-Ost': [49.4447, 7.775],
    'Innenstadt-Südwest': [49.44, 7.765],
    'Innenstadt-West/Kotten': [49.445, 7.76],
    'Kaiserslautern-West': [49.44, 7.75],
    'Lämmchesberg/Uniwohnstadt': [49.425, 7.745],
    Morlautern: [49.465, 7.81],
    Mölschbach: [49.475, 7.82],
    Siegelbach: [49.485, 7.805],

    // Mannheim districts
    Feudenheim: [49.5194, 8.5378],
    Friedrichsfeld: [49.53, 8.56],
    'Innenstadt/Jungbusch': [49.4875, 8.4706],
    Käfertal: [49.5278, 8.5056],
    Lindenhof: [49.4755, 8.4611],
    Neckarau: [49.465, 8.52],
    'Neckarstadt-Ost': [49.5058, 8.4944],
    'Neckarstadt-West': [49.495, 8.475],
    'Neuostheim/Neuhermsheim': [49.48, 8.51],
    Rheinau: [49.445, 8.535],
    Sandhofen: [49.545, 8.49],
    Schönau: [49.535, 8.47],
    'Schwetzingerstadt/Oststadt': [49.4844, 8.4889],
    Seckenheim: [49.455, 8.575],
    Vogelstang: [49.515, 8.46],
    Waldhof: [49.52, 8.455],
    Wallstadt: [49.495, 8.445],
  };

  ngOnInit() {
    this.loadCSVData();
  }

  private async loadCSVData() {
    try {
      this.isLoading = true;
      this.errorMessage = '';

      // Parse CSV data (you'll need to implement CSV parsing or use a library)
      const csvData = this.parseCSVData();
      this.districts = this.processDistrictData(csvData);
    } catch (error) {
      this.errorMessage =
        'Fehler beim Laden der Daten: ' + (error as Error).message;
      console.error('Error loading CSV data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private parseCSVData(): any[] {
    const csvText = `Stadt;Stadtbezirk;Anzahl_Spielplätze;Spielplätze_pro_100;Index_Spielplätze;Anzahl_Kinderärzte;Kinderärzte_pro_100;Index_Kinderärzte;Grundschule_plätze;Grundschulen_pro_100;Index_Grundschule;Kita_Plätze;Kitas_pro_100;Index_Kitas;gesamt_Einwohner;0-6;%0-6;6 bis 10;% 6 bis 10;0-10;%0-10;Index_%0-10;Index_gesamt;index_1_to_5;index_final
Kaiserslautern;Betzenberg;8;1,72;2,09;2;0,43;4,58;156;73,58;2,22;181;71,83;2,75;5096;252;4,95;212;4,16;464;9,11;2,93;2,89;4,04;4
Kaiserslautern;Bännjerrück/Karl-Pfaff-S.;13;3,86;3,94;0;0;1;370;262,41;5;150;76,53;2,87;5050;196;3,88;141;2,79;337;6,67;1,66;2,89;4,04;4
Kaiserslautern;Dansenberg;7;3,26;3,42;0;0;1;90;111,11;2,53;97;72,39;2,77;2428;134;5,52;81;3,34;215;8,86;2,8;2,54;3,16;3
Kaiserslautern;Einsiedlerhof;5;4,67;4,64;0;0;1;0;0;1;70;116,67;3,85;1315;60;4,56;47;3,57;107;8,14;2,42;2,58;3,26;3
Kaiserslautern;Erfenbach;2;0,81;1,3;0;0;1;141;122,61;3,07;108;81,2;2,98;2746;133;4,84;115;4,19;248;9,03;2,89;2,21;2,33;2
Kaiserslautern;Erlenbach;2;1,08;1,54;0;0;1;61;79,22;2,2;48;44,44;2,09;2214;108;4,88;77;3,48;185;8,36;2,54;1,88;1,5;2
Kaiserslautern;Erzhütten/Wiesenthalerhof;1;0,49;1,03;0;0;1;86;85,12;2,53;86;82,69;3,02;2558;104;4,07;101;3,95;205;8,01;2,36;1,94;1,65;2
Kaiserslautern;Grübentälchen/Volkspark;14;1,62;2,01;0;0;1;74;20,05;1,31;490;99,39;3,43;9993;493;4,93;369;3,69;862;8,63;2,68;2,08;2,01;2
Kaiserslautern;Hohenecken;13;4,42;4,42;0;0;1;154;128,33;2,91;124;71,26;2,74;3562;174;4,88;120;3,37;294;8,25;2,48;2,72;3,62;4
Kaiserslautern;Innenstadt-Nord/Kaiserberg;19;3,01;3,21;0;0;1;210;80,46;2,21;0;0;1;8910;370;4,15;261;2,93;631;7,08;1,87;1,86;1,45;1
Kaiserslautern;Innenstadt-Ost;4;0,46;1;2;0,23;2,92;683;189,72;3,84;472;91,47;3,23;11442;516;4,51;360;3,15;876;7,66;2,17;2,64;3,42;3
Kaiserslautern;Innenstadt-Südwest;3;0,47;1,01;1;0,16;2,33;230;97,46;2,32;192;48,24;2,18;8769;398;4,54;236;2,69;634;7,23;1,95;1,99;1,78;2
Kaiserslautern;Innenstadt-West/Kotten;14;1,44;1,85;0;0;1;220;57,29;1,82;0;0;1;11267;591;5,25;384;3,41;975;8,65;2,69;1,68;1;1
Kaiserslautern;Kaiserslautern-West;11;1,21;1,65;0;0;1;130;32,75;1,52;0;0;1;8565;509;5,94;397;4,64;906;10,58;3,69;1,77;1,23;1
Kaiserslautern;Lämmchesberg/Uniwohnstadt;29;5,09;5;1;0,18;2,5;284;120,34;2,82;547;163,77;5;10559;334;3,16;236;2,24;570;5,4;1;3,27;5;5
Kaiserslautern;Morlautern;6;2,41;2,69;0;0;1;90;79,56;2,32;120;88,24;3,16;2886;136;4,71;113;3,92;249;8,63;2,68;2,35;2,69;3
Kaiserslautern;Mölschbach;2;2,04;2,37;0;0;1;0;0;1;53;85,48;3,09;1170;62;5,3;36;3,08;98;8,38;2,55;2;1,81;2
Kaiserslautern;Siegelbach;7;2,09;2,41;0;0;1;58;38,16;1,63;100;54,64;2,33;3067;183;5,97;152;4,96;335;10,92;3,87;2,24;2,41;2
Mannheim;Feudenheim;16;1,21;1,65;1;0,08;1,67;460;90,02;2,27;317;39,33;1,96;14067;806;5,73;511;3,63;1317;9,36;3,06;2,14;2,16;2
Mannheim;Friedrichsfeld;8;1,46;1,86;0;0;1;208;99,05;2,38;168;49,56;2,21;5583;339;6,07;210;3,76;549;9,83;3,3;2,18;2,26;2
Mannheim;Innenstadt/Jungbusch;14;0,73;1,24;4;0,21;2,75;724;112,42;2,38;749;59,3;2,45;31011;1263;4,07;644;2,08;1907;6,15;1,39;2,11;2,08;2
Mannheim;Käfertal;51;1,15;1,6;2;0,04;1,33;1651;107,63;2,35;986;33,84;1,83;33957;2914;8,58;1534;4,52;4448;13,1;5;2,48;3,01;3
Mannheim;Lindenhof;10;0,86;1,34;2;0,17;2,42;366;98,39;2,14;346;43,41;2,06;13724;797;5,81;372;2,71;1169;8,52;2,62;2,19;2,28;2
Mannheim;Neckarau;35;1,29;1,72;4;0,15;2,25;825;81,12;2,11;608;35,98;1,88;30599;1690;5,52;1017;3,32;2707;8,85;2,79;2,18;2,26;2
Mannheim;Neckarstadt-Ost;30;1,61;1,41;7;0,22;2,83;561;24,09;1,63;1035;51,57;2,26;35171;2007;5,71;1234;3,51;3241;9,21;2,98;2,23;2,38;2
Mannheim;Neckarstadt-West;14;0,43;1,25;0;0;1;1310;138,25;3,56;641;54,32;2,33;19939;1180;5,92;685;3,44;1865;9,35;3,05;2,31;2,58;3
Mannheim;Neuostheim/Neuhermsheim;10;1,45;1,86;0;0;1;253;93,7;2,34;358;85,65;3,09;7232;418;5,78;270;3,73;688;9,51;3,14;2,3;2,56;3
Mannheim;Rheinau;27;1,08;1,54;2;0,08;1,67;875;91,24;2,28;633;41,26;2,01;25317;1534;6,06;959;3,79;2493;9,85;3,31;2,18;2,26;2
Mannheim;Sandhofen;13;0,99;1,46;1;0,08;1,67;414;78,26;2,15;228;28,93;1,71;14107;788;5,59;529;3,75;1317;9,34;3,05;2,02;1,86;2
Mannheim;Schönau;32;2,26;2,55;0;0;1;536;97,99;2,38;497;57,06;2,39;12682;871;6,87;547;4,31;1418;11,18;4;2,49;3,04;3
Mannheim;Schwetzingerstadt/Oststadt;29;1,73;2,1;8;0,48;5;481;87,93;2,05;569;50,49;2,23;23548;1127;4,79;547;2,32;1674;7,11;1,89;2,71;3,59;4
Mannheim;Seckenheim;20;1,16;1,61;2;0,12;2;458;67,35;1,97;470;45,15;2,1;15940;1041;6,53;680;4,27;1721;10,8;3,81;2,31;2,58;3
Mannheim;Vogelstang;31;2,37;2,65;1;0,08;1,67;434;89,48;2,21;401;48,67;2,19;12601;824;6,54;485;3,85;1309;10,39;3,59;2,49;3,04;3
Mannheim;Waldhof;30;1,03;1,5;1;0,03;1,25;613;56,08;1,77;697;38,79;1,95;25423;1797;7,07;1093;4,3;2890;11,37;4,1;2,13;2,13;2
Mannheim;Wallstadt;23;3,38;3,53;2;0,29;3,42;254;95,13;2,36;231;55,93;2,37;7746;413;5,33;267;3,45;680;8,78;2,76;2,9;4,07;4
Mannheim;Gesamt;23,11764706;1,422941176;1,815882353;2,176470588;0,119411765;1,995882353;613,1176471;88,71352941;2,254705882;525,5294118;48,19058824;2,177647059;19332,17647;1165,235294;5,998235294;681,4117647;3,572941176;1846,647059;9,570588235;3,167058824;2,314705882;;
Kaiserslautern;Gesamt;8,888888889;2,230555556;2,532222222;0,333333333;0,055555556;1,462777778;168,7222222;87,67611111;2,347222222;157,6666667;69,34666667;2,693888889;5644,277778;264,0555556;4,78;191;3,531111111;455,0555556;8,310555556;2,512777778;2,307222222;;

`;

    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(';');
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(';');
      const row: any = {};

      headers.forEach((header, index) => {
        let value = values[index];

        // Convert German decimal format to English (comma to dot)
        if (value && value.includes(',')) {
          value = value.replace(',', '.');
        }

        // Try to parse as number
        const numValue = parseFloat(value);
        row[header] = !isNaN(numValue) ? numValue : value;
      });

      data.push(row);
    }
    return data;
  }

  private processDistrictData(csvData: any[]): District[] {
    const districts = csvData.map((row, index) => {
      const districtName = row['Stadtbezirk'];
      const city = row['Stadt'];
      const coordinates = this.districtCoordinates[districtName] || [49.45, 7.77]; // Fallback coordinates

      // Calculate overall index based on AVG column, scale to 1-5
      const avgIndex = row['AVG'] || 0;
      const scaledIndex = Math.max(1, Math.min(5, Math.round(avgIndex)));

      const district: District = {
        id: `${city.toLowerCase().substring(0, 2)}-${districtName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: districtName,
        city: city,
        coordinates: coordinates,
        kitas: row['Kita_Plätze'] || 0,
        grundschulen: row['Grundschule_plätze'] || 0,
        kinderaerzte: row['Anzahl_Kinderärzte'] || 0,
        spielplaetze: row['Anzahl_Spielplätze'] || 0,
        kinderanteil: row['%0-10'] || 0,
        index: scaledIndex,
        color: this.getColorForIndex(scaledIndex),
        // Additional CSV properties
        kitasIndex: row['Index_Kitas'] || 0,
        grundschulenIndex: row['Index_Grundschule'] || 0,
        kinderaerzteIndex: row['Index_Kinderärzte'] || 0,
        spielplaetzeIndex: row['Index_Spielplätze'] || 0,
        gesamt_kinder: row['gesamt_Kinder'] || 0,
        kinder_0_6: row['0-6'] || 0,
        kinder_6_10: row['6-10'] || 0,
        kinder_0_10: row['0-10'] || 0,
        kinder_grundschule: row['Grundschulen_pro_100'] || 0,
        kinderanteilIndex: row['Index_%0-10'] || 0,
        gesamt_Einwohner: row['gesamt_Einwohner'] || 0,
        avg_index: row['AVG'] || 0,
      };

      // Set default districts
      if (city === 'Mannheim' && districtName === 'Innenstadt/Jungbusch') {
        this.defaultMannheimDistrict = district;
        this.selectedMannheim = district;
      } else if (city === 'Kaiserslautern' && districtName === 'Innenstadt-Ost') {
        this.defaultKaiserslauternDistrict = district;
        this.selectedKaiserslautern = district;
      }

      return district;
    });

    return districts;
  }

  private getColorForIndex(index: number): string {
    const colors = {
      1: '#d73027', // Sehr niedrig - rot
      2: '#f46d43', // Niedrig - orange
      3: '#fdae61', // Mittel - gelb
      4: '#abd9e9', // Hoch - hellblau
      5: '#2166ac', // Sehr hoch - dunkelblau
    };
    return colors[index as keyof typeof colors] || '#gray';
  }

  onDistrictSelected(district: District) {
    if (district.city === 'Mannheim') {
      this.selectedMannheim = district;
    } else if (district.city === 'Kaiserslautern') {
      this.selectedKaiserslautern = district;
    }
  }
}
