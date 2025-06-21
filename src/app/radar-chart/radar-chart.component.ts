 import { Component, Input, OnInit, OnChanges, OnDestroy, PLATFORM_ID, Inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { District } from '../app.component';

declare var echarts: any;

@Component({
  selector: 'app-radar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <div #chartContainer class="chart" id="radar-chart"></div>
      <div class="chart-legend">
        <div class="legend-item mannheim">
          <span class="legend-color mannheim"></span>
          <span>{{ mannheimDistrict?.name }} (Mannheim)</span>
        </div>
        <div class="legend-item kaiserslautern">
          <span class="legend-color kaiserslautern"></span>
          <span>{{ kaiserslauternDistrict?.name }} (Kaiserslautern)</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      width: 100%;
      height: 100%;
    }

    .chart {
      width: 100%;
      height: 350px;
      min-height: 350px;
    }

    .chart-legend {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-top: 15px;
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      color: #555;
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 3px;
    }

    .legend-color.mannheim {
      background: linear-gradient(135deg, #667eea, #764ba2);
    }

    .legend-color.kaiserslautern {
      background: linear-gradient(135deg, #f093fb, #f5576c);
    }

    @media (max-width: 768px) {
      .chart {
        height: 300px;
        min-height: 300px;
      }

      .chart-legend {
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
    }
  `]
})
export class RadarChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() mannheimDistrict: District | null = null;
  @Input() kaiserslauternDistrict: District | null = null;
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  private chart: any;
  private isClient = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isClient = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isClient) {
      this.loadECharts();
    }
    console.log(this.kaiserslauternDistrict)
    console.log( this.kaiserslauternDistrict?.index)

  }

  ngOnChanges() {
    if (this.chart && this.mannheimDistrict && this.kaiserslauternDistrict) {
      this.updateChart();
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  private loadECharts() {
    if (typeof echarts === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.3/echarts.min.js';
      script.onload = () => {
        setTimeout(() => this.initChart(), 100);
      };
      document.head.appendChild(script);
    } else {
      this.initChart();
    }
  }

  private initChart() {
    if (!this.chartContainer?.nativeElement) return;

    this.chart = echarts.init(this.chartContainer.nativeElement);

    if (this.mannheimDistrict && this.kaiserslauternDistrict) {
      this.updateChart();
    }

    // Responsive
    window.addEventListener('resize', () => {
      if (this.chart) {
        this.chart.resize();
      }
    });
  }

  private updateChart() {
    if (!this.chart || !this.mannheimDistrict || !this.kaiserslauternDistrict) return;

    // Normalisierte Werte für bessere Vergleichbarkeit im Radar Chart
    // const normalizeValue = (value: number, min: number, max: number): number => {
    //   return ((value - min) / (max - min)) * 100;
    // };

    // Min/Max Werte für Normalisierung (basierend auf allen Stadtteilen)
    // const ranges = {
    //   kitas: { min: 4, max: 15 },
    //   grundschulen: { min: 1, max: 5 },
    //   kinderaerzte: { min: 2, max: 8 },
    //   spielplaetze: { min: 5, max: 22 },
    //   kinderanteil: { min: 6.5, max: 14.2 }
    // };

    const mannheimData = [
      this.kaiserslauternDistrict?.kitasIndex,
      this.kaiserslauternDistrict?.grundschulenIndex,
      this.kaiserslauternDistrict?.kinderaerzteIndex,
       this.kaiserslauternDistrict?.spielplaetzeIndex,
      this.kaiserslauternDistrict?.kinderanteilIndex
    ];

    const kaiserslauternData = [
      this.mannheimDistrict?.kitasIndex,
      this.mannheimDistrict?.grundschulenIndex,
      this.mannheimDistrict?.kinderaerzteIndex,
       this.mannheimDistrict?.spielplaetzeIndex,
      this.mannheimDistrict?.kinderanteilIndex
    ];

    const option = {
    title: {
      text: 'Kinderfreundlichkeits-Indikatoren',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const district = params.seriesName === 'Mannheim' ? this.mannheimDistrict : this.kaiserslauternDistrict;
        const indicators = ['Kitas', 'Grundschulen', 'Kinderärzte', 'Spielplätze', 'Kinderanteil'];
        const values = [
          district?.kitas,
          district?.grundschulen,
          district?.kinderaerzte,
          district?.spielplaetze,
          district?.kinderanteil + '%'
        ];

        return `
          <strong>${params.seriesName}: ${district?.name}</strong><br/>
          ${indicators[params.dataIndex]}: ${values[params.dataIndex]}<br/>
          <em>Index-Wert: ${params.value.toFixed(1)}</em>
        `;
      }
    },
    legend: {
      show: false
    },
    radar: {
      center: ['50%', '55%'],
      radius: '65%',
      indicator: [
        { name: 'Kitas', max: 5, color: '#666' },
        { name: 'Grundschulen', max: 5, color: '#666' },
        { name: 'Kinderärzte', max: 5, color: '#666' },
        { name: 'Spielplätze', max: 5, color: '#666' },
        { name: 'Kinderanteil\n(0-10 Jahre)', max: 5, color: '#666' }
      ],
      name: {
        textStyle: {
          fontSize: 12,
          color: '#666',
          fontWeight: 'bold'
        }
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(114, 172, 209, 0.1)', 'rgba(114, 172, 209, 0.05)']
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(114, 172, 209, 0.3)'
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(114, 172, 209, 0.5)'
        }
      }
    },
    series: [
      {
        name: 'Mannheim',
        type: 'radar',
        data: [
          {
            value: mannheimData,
            name: this.mannheimDistrict.name,
            areaStyle: {
              color: 'rgba(102, 126, 234, 0.2)'
            },
            lineStyle: {
              color: '#667eea',
              width: 3
            },
            itemStyle: {
              color: '#667eea',
              borderColor: '#667eea',
              borderWidth: 2
            }
          }
        ]
      },
      {
        name: 'Kaiserslautern',
        type: 'radar',
        data: [
          {
            value: kaiserslauternData,
            name: this.kaiserslauternDistrict.name,
            areaStyle: {
              color: 'rgba(240, 147, 251, 0.2)'
            },
            lineStyle: {
              color: '#f093fb',
              width: 3
            },
            itemStyle: {
              color: '#f093fb',
              borderColor: '#f093fb',
              borderWidth: 2
            }
          }
        ]
      }
    ]
  };

  this.chart.setOption(option, true);
}
}
