import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { District } from '../app.component';
import * as echarts from 'echarts';

// Erweiterte District-Schnittstelle für die Chart-Daten
interface ExtendedDistrict extends District {
  // Basierend auf Ihren Tabellendaten
  'Spielplätze_pro_100'?: number;
  'Kinderärzte_pro_100'?: number;
  Grundschulen_pro_100?: number;
  Kitas_pro_100?: number;
  '%0-10'?: number;           // Kinderanteil 0-10 Jahre in Prozent
  Index_gesamt?: number;      // Gesamtindex

  // Zusätzliche Felder aus Ihren Daten
  Index_Spielplätze?: number;
  Index_Kinderärzte?: number;
  Index_Grundschule?: number;
  Index_Kitas?: number;
  'Index_%0-10'?: number;
  AVG?: number;
  //  kinder_grundschule?: number;
}

@Component({
  selector: 'app-comparison-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <!-- Header mit Scores -->
      <div class="header-scores">
        <div class="score-item mannheim">
          <span class="score-circle">{{ getMannheimScore() }}/5</span>
          <span class="city-name">Mannheim {{mannheimDistrict?.name}}</span>
        </div>
        <div class="score-item kaiserslautern">
          <span class="score-circle">{{ getKaiserslauternScore() }}/5</span>
          <span class="city-name">Kaiserslautern  {{kaiserslauternDistrict?.name}}</span>
        </div>
      </div>

      <!-- Titel -->
      <h3 class="chart-title">Anzahl pro 100 Kinder</h3>

      <!-- ECharts Container -->
      <div #chartContainer class="chart" style="height: 400px;"></div>
    </div>
  `,
  styles: [`
    .chart-container {
      // width: 100%;
      // background: white;
      // border-radius: 12px;
      // padding: 20px;
      // box-shadow: 0 2px 12px rgba(0,0,0,0.1);
    }

    .header-scores {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }

    .score-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .score-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 0.9rem;
    }

    .score-item.mannheim .score-circle {
      background: #dc3545;
    }

    .score-item.kaiserslautern .score-circle {
      background: #007bff;
    }

    .city-name {
      font-weight: 600;
      color: #333;
    }

    .chart-title {
      margin: 0 0 20px 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
    }

    .chart {
      width: 100%;
    }
  `]
})
export class ComparisonTableComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() mannheimDistrict: District | null = null;
  @Input() kaiserslauternDistrict: District | null = null;
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;

  private chart: echarts.ECharts | null = null;

  // Default-Werte für Gesamtdaten (basierend auf Ihren ursprünglichen Daten)
  private defaultMannheimDistrict: ExtendedDistrict = {
    name: 'Gesamt',
    kitas: 23,
    grundschulen: 1,
    kinderaerzte: 2,
    spielplaetze: 2,
    kinderanteil: 9.6,
    index: 2.1,
    coordinates: [49.4875, 8.4660],
    // Pro 100 Kinder Werte (Default-Werte)
    Kitas_pro_100: 9,
    Grundschulen_pro_100: 6,
    'Kinderärzte_pro_100': 1,
    'Spielplätze_pro_100': 5,
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
    // Pro 100 Kinder Werte (Default-Werte)
    Kitas_pro_100: 7,
    Grundschulen_pro_100: 8,
    'Kinderärzte_pro_100': 2,
    'Spielplätze_pro_100': 6,
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
     kinder_grundschule: 0
  };

  ngOnInit() {}

  ngAfterViewInit() {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Wenn sich die Input-Daten ändern, Chart aktualisieren
    if ((changes['mannheimDistrict'] || changes['kaiserslauternDistrict']) && this.chart) {
      this.updateChart();
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  get displayMannheimDistrict(): ExtendedDistrict {
    return this.mannheimDistrict as ExtendedDistrict || this.defaultMannheimDistrict;
  }

  get displayKaiserslauternDistrict(): ExtendedDistrict {
    return this.kaiserslauternDistrict as ExtendedDistrict || this.defaultKaiserslauternDistrict;
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
      return Math.round(district.Kitas_pro_100 || district.kitas / district.kinder_0_6 * 100 || 0);
    case 'grundschulen':
      return Math.round(district.Grundschulen_pro_100 || district.kinder_grundschule || 0);
    case 'kinderaerzte':
      return Math.round(district['Kinderärzte_pro_100'] || district.kinderaerzte || 0);
    case 'spielplaetze':
      return Math.round(district['Spielplätze_pro_100'] || district.spielplaetze || 0);
    case 'kinderanteil':
      return Math.round(district.kinderanteil || 0);
    default:
      return 0;
  }
}

  private initChart() {
    if (!this.chartContainer) return;

    this.chart = echarts.init(this.chartContainer.nativeElement);
    this.updateChart();

    // Responsive
    window.addEventListener('resize', () => {
      if (this.chart) {
        this.chart.resize();
      }
    });
  }

private updateChart() {
  if (!this.chart) return;

  const mannheim = this.displayMannheimDistrict;
  const kaiserslautern = this.displayKaiserslauternDistrict;

  // DEBUG: Alle verfügbaren Felder ausgeben
  console.log('Mannheim District Felder:', Object.keys(mannheim));
  console.log('Mannheim Spielplätze_pro_100:', mannheim['Spielplätze_pro_100']);
  console.log('Mannheim Kinderärzte_pro_100:', mannheim['Kinderärzte_pro_100']);
  console.log('Mannheim Grundschulen_pro_100:', mannheim['Grundschulen_pro_100']);
  console.log('Mannheim Kitas_pro_100:', mannheim.Kitas_pro_100);
  console.log('Mannheim %0-10:', mannheim['%0-10']);

  // Dynamisch das Maximum basierend auf den tatsächlichen Werten berechnen
  const allValues = [
    this.getChartValue(mannheim, 'kinderanteil'),
    this.getChartValue(mannheim, 'kinderaerzte'),
    this.getChartValue(mannheim, 'spielplaetze'),
    this.getChartValue(mannheim, 'grundschulen'),
    this.getChartValue(mannheim, 'kitas'),
    this.getChartValue(kaiserslautern, 'kinderanteil'),
    this.getChartValue(kaiserslautern, 'kinderaerzte'),
    this.getChartValue(kaiserslautern, 'spielplaetze'),
    this.getChartValue(kaiserslautern, 'grundschulen'),
    this.getChartValue(kaiserslautern, 'kitas')
  ];

  const maxValue = Math.max(...allValues);
  // Etwas Puffer hinzufügen (10% mehr als der höchste Wert)
  const chartMax = Math.ceil(maxValue * 1.1);

  const option = {
    grid: {
      left: '15%',
      right: '10%',
      top: '5%',
      bottom: '5%'
    },
    xAxis: {
      type: 'value',
      max: chartMax, // Dynamisches Maximum statt festem Wert
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false
      },
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'category',
      data: ['Kinderanteil', 'Kinderärzte', 'Spielplätze', 'Grundschule', 'Kita'],
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        fontSize: 12,
        color: '#666'
      }
    },
    series: [
      {
        name: 'Mannheim',
        type: 'bar',
        data: [
          this.getChartValue(mannheim, 'kinderanteil'),
          this.getChartValue(mannheim, 'kinderaerzte'),
          this.getChartValue(mannheim, 'spielplaetze'),
          this.getChartValue(mannheim, 'grundschulen'),
          this.getChartValue(mannheim, 'kitas')
        ],
        itemStyle: {
          color: '#dc3545'
        },
        barWidth: 20,
        label: {
          show: true,
          position: 'inside',
          color: 'white',
          fontSize: 11,
          fontWeight: 'bold',
          formatter: '{c}'
        }
      },
      {
        name: 'Kaiserslautern',
        type: 'bar',
        data: [
          this.getChartValue(kaiserslautern, 'kinderanteil'),
          this.getChartValue(kaiserslautern, 'kinderaerzte'),
          this.getChartValue(kaiserslautern, 'spielplaetze'),
          this.getChartValue(kaiserslautern, 'grundschulen'),
          this.getChartValue(kaiserslautern, 'kitas')
        ],
        itemStyle: {
          color: '#007bff'
        },
        barWidth: 20,
        label: {
          show: true,
          position: 'inside',
          color: 'white',
          fontSize: 11,
          fontWeight: 'bold',
          formatter: '{c}'
        }
      }
    ],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params: any) {
        let result = '';
        params.forEach((item: any) => {
          result += `${item.seriesName}: ${item.value} pro 100 Kinder<br/>`;
        });
        return result;
      }
    }
  };

  this.chart.setOption(option);
}

  // Legacy methods für Kompatibilität (falls noch verwendet)
  getDifference(indicator: keyof District): string {
    const mannheimValue = this.displayMannheimDistrict[indicator] as number;
    const kaiserslauternValue = this.displayKaiserslauternDistrict[indicator] as number;
    const diff = mannheimValue - kaiserslauternValue;

    if (diff > 0) {
      return `+${diff.toFixed(indicator === 'kinderanteil' ? 1 : 0)}`;
    } else if (diff < 0) {
      return diff.toFixed(indicator === 'kinderanteil' ? 1 : 0);
    } else {
      return '0';
    }
  }

  getDifferenceClass(indicator: keyof District): string {
    const mannheimValue = this.displayMannheimDistrict[indicator] as number;
    const kaiserslauternValue = this.displayKaiserslauternDistrict[indicator] as number;
    const diff = mannheimValue - kaiserslauternValue;

    if (diff > 0) return 'positive';
    if (diff < 0) return 'negative';
    return 'neutral';
  }

  getDifferenceIndicator(indicator: keyof District): string {
    const mannheimValue = this.displayMannheimDistrict[indicator] as number;
    const kaiserslauternValue = this.displayKaiserslauternDistrict[indicator] as number;
    const diff = mannheimValue - kaiserslauternValue;

    if (diff > 0) return '↑';
    if (diff < 0) return '↓';
    return '=';
  }

  getTotalFacilities(district: District): number {
    return district.kitas + district.grundschulen + district.kinderaerzte + district.spielplaetze;
  }
}
