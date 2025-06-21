import { Component, OnInit } from '@angular/core';
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
  // Additional properties from CSV
  kitasIndex: number;
  grundschulenIndex: number;
  kinderaerzteIndex: number;
  spielplaetzeIndex: number;
  gesamt_kinder: number;
  kinder_0_6: number;
  kinder_6_10: number;
    kinderanteilIndex: number;
  gesamt_Einwohner: number;
  avg_index: number;
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

        <!-- Loading indicator -->
        <div *ngIf="isLoading" class="loading">
          <p>Lade Daten...</p>
        </div>

        <!-- Error message -->
        <div *ngIf="errorMessage" class="error">
          <p>{{ errorMessage }}</p>
        </div>
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

    .loading, .error {
      background: white;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 25px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      text-align: center;
    }

    .error {
      background: #fee;
      color: #c33;
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
export class AppComponent implements OnInit {
  selectedMannheim: District | null = null;
  selectedKaiserslautern: District | null = null;
  districts: District[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  // Approximate coordinates for districts (you may want to adjust these)
  private readonly districtCoordinates: { [key: string]: [number, number] } = {
    // Kaiserslautern districts
    'Betzenberg': [49.4386, 7.7589],
    'Bännjerrück/Karl-Pfaff-Siedlung': [49.4500, 7.7400],
    'Dansenberg': [49.4700, 7.7300],
    'Einsiedlerhof': [49.4200, 7.7800],
    'Erfenbach': [49.4600, 7.8000],
    'Erlenbach': [49.4300, 7.7200],
    'Erzhütten/Wiesenthalerhof': [49.4100, 7.7600],
    'Grübentälchen/Volkspark': [49.4450, 7.7650],
    'Hohenecken': [49.4800, 7.7100],
    'Innenstadt-Nord/Kaiserberg': [49.4500, 7.7700],
    'Innenstadt-Ost': [49.4447, 7.7750],
    'Innenstadt-Südwest': [49.4400, 7.7650],
    'Innenstadt-West/Kotten': [49.4450, 7.7600],
    'Kaiserslautern-West': [49.4400, 7.7500],
    'Lämmchesberg/Uniwohnstadt': [49.4250, 7.7450],
    'Morlautern': [49.4650, 7.8100],
    'Mölschbach': [49.4750, 7.8200],
    'Siegelbach': [49.4850, 7.8050],

    // Mannheim districts
    'Feudenheim': [49.5194, 8.5378],
    'Friedrichsfeld': [49.5300, 8.5600],
    'Innenstadt/Jungbusch': [49.4875, 8.4706],
    'Käfertal': [49.5278, 8.5056],
    'Lindenhof': [49.4755, 8.4611],
    'Neckarau': [49.4650, 8.5200],
    'Neckarstadt-Ost': [49.5058, 8.4944],
    'Neckarstadt-West': [49.4950, 8.4750],
    'Neuostheim/Neuhermsheim': [49.4800, 8.5100],
    'Rheinau': [49.4450, 8.5350],
    'Sandhofen': [49.5450, 8.4900],
    'Schönau': [49.5350, 8.4700],
    'Schwetzingerstadt/Oststadt': [49.4844, 8.4889],
    'Seckenheim': [49.4550, 8.5750],
    'Vogelstang': [49.5150, 8.4600],
    'Waldhof': [49.5200, 8.4550],
    'Wallhof': [49.4950, 8.4450]
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
      this.errorMessage = 'Fehler beim Laden der Daten: ' + (error as Error).message;
      console.error('Error loading CSV data:', error);
    } finally {
      this.isLoading = false;
    }
  }


  private parseCSVData(): any[] {
    // Here you would typically use a CSV parsing library like Papa Parse
    // For now, I'll provide a manual parsing approach based on your data
    const csvText = `Stadt;Stadtbezirk;Anzahl_Spielplätze;Spielplätze_pro_100;Index_Spielplätze;Anzahl_Kinderärzte;Kinderärzte_pro_100;Index_Kinderärzte;Grundschule_plätze;Grundschulen_pro_100;Index_Grundschule;Kita_Plätze;Kitas_pro_100;Index_Kitas;gesamt_Einwohner;0-6;%0-6;6 bis 10;% 6 bis 10;0-10;%0-10;Index_%0-10;Index_gesamt;AVG
Kaiserslautern;Betzenberg;8;1,72;2,09;2;0,43;5;156;73,58;2,12;181;71,83;2,71;5096;252;4,95;212;4,16;464;9,11;2,93;3,61;2,98
Kaiserslautern;Bännjerrück/Karl-Pfaff-Siedlung;13;3,86;3,94;0;0;1;370;262,41;5;150;76,53;2,82;5050;196;3,88;141;2,79;337;6,67;1,66;3,93;3,19
Kaiserslautern;Dansenberg;7;3,26;3,42;0;0;1;90;111,11;2,69;97;72,39;2,73;2428;134;5,52;81;3,34;215;8,86;2,8;2,81;2,46
Kaiserslautern;Einsiedlerhof;5;4,67;4,64;0;0;1;0;0;1;70;116,67;3,78;1315;60;4,56;47;3,57;107;8,14;2,42;3,04;2,61
Kaiserslautern;Erfenbach;2;0,81;1,3;0;0;1;141;122,61;2,87;108;81,2;2,94;2746;133;4,84;115;4,19;248;9,03;2,89;2,14;2,03
Kaiserslautern;Erlenbach;2;1,08;1,54;0;0;1;61;79,22;2,21;48;44,44;2,06;2214;108;4,88;77;3,48;185;8,36;2,54;1,63;1,7
Kaiserslautern;Erzhütten/Wiesenthalerhof;1;0,49;1,03;0;0;1;86;85,12;2,3;86;82,69;2,97;2558;104;4,07;101;3,95;205;8,01;2,36;1,83;1,83
Kaiserslautern;Grübentälchen/Volkspark;14;1,62;2;0;0;1;74;20,05;1,31;490;99,39;3,37;9993;493;4,93;369;3,69;862;8,63;2,68;1,97;1,92
Kaiserslautern;Hohenecken;13;4,42;4,42;0;0;1;154;128,33;2,96;124;71,26;2,7;3562;174;4,88;120;3,37;294;8,25;2,48;3,29;2,77
Kaiserslautern;Innenstadt-Nord/Kaiserberg;19;3,01;3,2;0;0;1;210;80,46;2,23;0.0;0;1;8910;370;4,15;261;2,93;631;7,08;1,87;1,88;1,86
Kaiserslautern;Innenstadt-Ost;4;0,46;1;2;0,23;3,14;683;189,72;3,89;472;91,47;3,18;11442;516;4,51;360;3,15;876;7,66;2,17;3,33;2,8
Kaiserslautern;Innenstadt-Südwest;3;0,47;1,01;1;0;1;230;97,46;2,49;192;48,24;2,15;8769;398;4,54;236;2,69;634;7,23;1,95;1,57;1,66
Kaiserslautern;Innenstadt-West/Kotten;14;1,44;1,85;0;0;1;220;57,29;1,87;0.0;0;1;11267;591;5,25;384;3,41;975;8,65;2,69;1,22;1,43
Kaiserslautern;Kaiserslautern-West;11;1,21;1,65;0;0;1;130;32,75;1,5;0.0;0;1;8565;509;5,94;397;4,64;906;10,58;3,69;1;1,29
Kaiserslautern;Lämmchesberg/Uniwohnstadt;29;5,09;5;1;0,18;2,67;284;120,34;2,83;547;167,77;5;10559;334;3,16;236;2,24;570;5,4;1;5;3,88
Kaiserslautern;Morlautern;6;2,41;2,68;0;0;1;90;79,56;2,21;120;88,24;3,1;2886;136;4,71;113;3,92;249;8,63;2,68;2,48;2,25
Kaiserslautern;Mölschbach;2;2,04;2,37;0;0;1;0;0;1;53;85,48;3,04;1170;62;5,3;36;3,08;98;8,38;2,55;1,86;1,85
Kaiserslautern;Siegelbach;7;2,09;2,41;0;0;1;58;38,16;1,58;100;54,64;2,3;3067;183;5,97;152;4,96;335;10,92;3,87;1,82;1,82
Mannheim;Feudenheim;16;1,21;2,06;1;0,08;1,67;460;90,02;2,37;317;39,33;1,71;14067;806;5,73;511;3,63;1317;9,36;3,06;1,97;2,19
Mannheim;Friedrichsfeld;8;1,46;2,4;0;0;1;208;99,05;2,51;168;49,56;2,4;5583;339;6,07;210;3,76;549;9,83;3,3;2,31;2,36
Mannheim;Innenstadt/Jungbusch;14;0,73;1,41;4;0,21;2,75;724;112,42;2,71;749;59,3;3,07;31011;1263;4,07;644;2,08;1907;6,15;1,39;3,26;2,83
Mannheim;Käfertal;51;1,15;1,98;2;0,04;1,33;1651;107,63;2,64;986;33,84;1,33;33957;2914;8,58;1534;4,52;4448;13,1;5;1,87;2,14
Mannheim;Lindenhof;10;0,86;1,58;2;0,17;2,42;366;98,39;2,5;346;43,41;1,99;13724;797;5,81;372;2,71;1169;8,52;2,62;2,39;2,4
Mannheim;Neckarau;35;1,29;2,17;4;0,15;2,25;825;81,12;2,24;608;35,98;1,48;30599;1690;5,52;1017;3,32;2707;8,85;2,79;2,05;2,23
Mannheim;Neckarstadt-Ost;30;1,61;2,6;7;0,38;4,17;165;24,09;1,37;1035;87,71;5;35171;2007;5,71;1234;3,51;3241;9,21;2,98;3,99;3,19
Mannheim;Neckarstadt-West;14;0,43;1;0;0;1;1706;138,25;3,11;641;31,94;1,2;19939;1180;5,92;685;3,44;1865;9,35;3,05;1,69;2,05
Mannheim;Neuostheim/Neuhermsheim;10;1,45;2,38;0;0;1;253;93,7;2,43;358;85,65;4,86;7232;418;5,78;270;3,73;688;9,51;3,14;3,44;2,92
Mannheim;Rheinau;27;1,08;1,88;2;0,08;1,67;875;91,24;2,39;633;41,26;1,84;25317;1534;6,06;959;3,79;2493;9,85;3,31;1,97;2,19
Mannheim;Sandhofen;13;0,99;1,76;1;0,08;1,67;414;78,26;2,19;228;28,93;1;14107;788;5,59;529;3,75;1317;9,34;3,05;1,24;1,83
Mannheim;Schönau;32;2,26;3,48;0;0;1;536;97,99;2,49;497;57,06;2,91;12682;871;6,87;547;4,31;1418;11,18;4;3,1;2,75
Mannheim;Schwetzingerstadt/Oststadt;29;1,73;2,76;8;0,48;5;481;87,93;2,34;569;50,49;2,47;23548;1127;4,79;547;2,32;1674;7,11;1,89;4,35;3,37
Mannheim;Seckenheim;20;1,16;1,99;2;0,12;2;458;67,35;2,03;470;45,15;2,1;15940;1041;6,53;680;4,27;1721;10,8;3,81;1,89;2,15
Mannheim;Vogelstang;31;2,37;3,63;1;0,08;1,67;434;89,48;2,36;401;48,67;2,34;12601;824;6,54;485;3,85;1309;10,39;3,59;3,06;2,73
Mannheim;Waldhof;30;1,03;1,81;1;0,03;1,25;613;56,08;1,85;697;38,79;1,67;25423;1797;7,07;1093;4,3;2890;11,37;4,1;1;1,71
Mannheim;Wallhof;23;3,38;5;2;0,29;3,42;254;95,13;2,45;231;55,93;2,84;7746;413;5,33;267;3,45;680;8,78;2,76;5;3,69
Mannheim;Gesamt;23,11764706;1,422941176;2,346470588;2,176470588;0,128823529;2,074705882;613,1176471;88,71352941;;525,5294118;49;2,365294118;19332,17647;1165,235294;5,998235294;681,4117647;3,572941176;1846,647059;9,570588235;3,167058824;2,622352941;2,513529412
Kaiserslautern;Gesamt;8,888888889;2,230555556;2,530555556;0,333333333;0,046666667;1,433888889;168,7222222;87,67611111;;189,2;69,56888889;2,658333333;5644,277778;264,0555556;4,78;191;3,531111111;455,0555556;8,310555556;2,512777778;2,467222222;2,240555556
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
    return csvData.map((row, index) => {
      const districtName = row['Stadtbezirk'];
      const city = row['Stadt'];
      const coordinates = this.districtCoordinates[districtName] || [49.45, 7.77]; // Fallback coordinates

      // Calculate overall index based on AVG column, scale to 1-5
      const avgIndex = row['AVG'] || 0;
      const scaledIndex = Math.max(1, Math.min(5, Math.round(avgIndex)));

      return {
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
        kinder_6_10: row['6 bis 10'] || 0,
     kinderanteilIndex: row['Index_%0-10'] || 0,
        gesamt_Einwohner: row['gesamt_Einwohner']|| 0,
        avg_index: row['AVG'] || 0
      };
    });
  }

  private getColorForIndex(index: number): string {
    const colors = {
      1: '#d73027',  // Sehr niedrig - rot
      2: '#f46d43',  // Niedrig - orange
      3: '#fdae61',  // Mittel - gelb
      4: '#abd9e9',  // Hoch - hellblau
      5: '#2166ac'   // Sehr hoch - dunkelblau
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
