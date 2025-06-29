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
          <span>{{ getDisplayName('mannheim') }}</span>
        </div>
        <div class="legend-item kaiserslautern">
          <span class="legend-color kaiserslautern"></span>
          <span>{{ getDisplayName('kaiserslautern') }}</span>
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
      height: 500px;
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
      background: linear-gradient(135deg,rgb(245, 0, 0), #764ba2);
    }

    .legend-color.kaiserslautern {
      background: linear-gradient(135deg,rgb(147, 199, 251),rgb(3, 99, 255));
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

  // Default "Gesamt" data for both cities
  private defaultMannheimGesamt: District = {
    id: 'mannheim-gesamt',
    name: 'Gesamt',
    city: 'Mannheim',
    coordinates: [0, 0],
    index: 0,
    color: '#ff4d4d',
    kitas: 23.12,
    grundschulen: 1.42,
    kinderaerzte: 2.35,
    spielplaetze: 2.18,
    kinderanteil: 12.88,
    // Index values (scaled to 0-5 for radar chart)
    kitasIndex: 2.07,
    grundschulenIndex: 3.17,
    kinderaerzteIndex: 2.62,
    spielplaetzeIndex: 2.51,
    kinderanteilIndex: 2.36,
    // Additional required properties
    gesamt_kinder: 613.12, // From your data
    kinder_0_6: 88.71, // From your data
    kinder_6_10: 525.53, // From your data
    gesamt_Einwohner: 19332.18, // From your data
    avg_index: 2.54,
    kinder_0_10: 0,
    kinder_grundschule: 0
  };

  private defaultKaiserslauternGesamt: District = {
    id: 'kaiserslautern-gesamt',
    name: 'Gesamt',
    city: 'Kaiserslautern',
    coordinates: [0, 0],
    index: 0,
    color: '#3366ff',
    kitas: 8.89,
    grundschulen: 2.23,
    kinderaerzte: 2.53,
    spielplaetze: 0.33,
    kinderanteil: 4.67,
    // Index values (scaled to 0-5 for radar chart)
    kitasIndex: 2.51,
    grundschulenIndex: 2.47,
    kinderaerzteIndex: 2.24,
    spielplaetzeIndex: 1.43,
    kinderanteilIndex: 2.66,
    // Additional required properties
    gesamt_kinder: 168.72, // From your data
    kinder_0_6: 87.68, // From your data
    kinder_6_10: 189.2, // From your data
    gesamt_Einwohner: 5644.28, // From your data
    avg_index: 2.26,
    kinder_0_10: 0,
     kinder_grundschule:0,
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isClient = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isClient) {
      this.loadECharts();
    }
    console.log('=== INITIAL LOAD ===');
    console.log('Mannheim District:', this.mannheimDistrict);
    console.log('Kaiserslautern District:', this.kaiserslauternDistrict);

    // If no districts are provided, use default Gesamt data
    if (!this.mannheimDistrict) {
      this.mannheimDistrict = this.defaultMannheimGesamt;
      console.log('✓ Using default Mannheim Gesamt data');
    }

    if (!this.kaiserslauternDistrict) {
      this.kaiserslauternDistrict = this.defaultKaiserslauternGesamt;
      console.log('✓ Using default Kaiserslautern Gesamt data');
    }
  }

  ngOnChanges() {
    console.log('=== ngOnChanges TRIGGERED ===');
    console.log('Chart exists:', !!this.chart);
    console.log('Mannheim District exists:', !!this.mannheimDistrict);
    console.log('Kaiserslautern District exists:', !!this.kaiserslauternDistrict);

    // Use default data if none provided
    const mannheimData = this.mannheimDistrict || this.defaultMannheimGesamt;
    const kaiserslauternData = this.kaiserslauternDistrict || this.defaultKaiserslauternGesamt;

    if (this.chart) {
      console.log('✓ Updating existing chart');
      this.updateChart(mannheimData, kaiserslauternData);
    } else {
      console.log('⚠️ Chart not initialized yet, waiting for ECharts to load');
      setTimeout(() => {
        if (this.chart) {
          console.log('✓ Chart now available, updating');
          this.updateChart(mannheimData, kaiserslauternData);
        } else {
          console.log('❌ Chart still not available, forcing initialization');
          this.initChart();
        }
      }, 500);
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  getDisplayName(city: 'mannheim' | 'kaiserslautern'): string {
    if (city === 'mannheim') {
      const district = this.mannheimDistrict || this.defaultMannheimGesamt;
      return `${district.name} (Mannheim)`;
    } else {
      const district = this.kaiserslauternDistrict || this.defaultKaiserslauternGesamt;
      return `${district.name} (Kaiserslautern)`;
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
    console.log('=== INIT CHART ===');
    console.log('Container exists:', !!this.chartContainer?.nativeElement);

    if (!this.chartContainer?.nativeElement) {
      console.log('❌ Chart container not available');
      return;
    }

    console.log('Creating ECharts instance...');
    this.chart = echarts.init(this.chartContainer.nativeElement);
    console.log('✓ Chart instance created:', !!this.chart);

    // Use default data if no specific districts provided
    const mannheimData = this.mannheimDistrict || this.defaultMannheimGesamt;
    const kaiserslauternData = this.kaiserslauternDistrict || this.defaultKaiserslauternGesamt;

    console.log('Attempting initial chart update with data...');
    this.updateChart(mannheimData, kaiserslauternData);

    // Responsive
    window.addEventListener('resize', () => {
      if (this.chart) {
        this.chart.resize();
      }
    });
  }

  private updateChart(mannheimData?: District, kaiserslauternData?: District) {
    console.log('=== UPDATE CHART ===');
    console.log('Chart exists:', !!this.chart);

    if (!this.chart) {
      console.log('❌ Chart not initialized');
      return;
    }

    // Use provided data or fall back to input properties or defaults
    const mannheimDistrict = mannheimData || this.mannheimDistrict || this.defaultMannheimGesamt;
    const kaiserslauternDistrict = kaiserslauternData || this.kaiserslauternDistrict || this.defaultKaiserslauternGesamt;

    console.log('Using Mannheim District:', mannheimDistrict.name);
    console.log('Using Kaiserslautern District:', kaiserslauternDistrict.name);

    // Prepare data arrays for the radar chart
    const mannheimChartData = [
      mannheimDistrict.kitasIndex || 0,
      mannheimDistrict.grundschulenIndex || 0,
      mannheimDistrict.kinderaerzteIndex || 0,
      mannheimDistrict.spielplaetzeIndex || 0,
      mannheimDistrict.kinderanteilIndex || 0,

    ];

    const kaiserslauternChartData = [
      kaiserslauternDistrict.kitasIndex || 0,
      kaiserslauternDistrict.grundschulenIndex || 0,
      kaiserslauternDistrict.kinderaerzteIndex || 0,
      kaiserslauternDistrict.spielplaetzeIndex || 0,
      kaiserslauternDistrict.kinderanteilIndex || 0
    ];

    console.log('Mannheim Chart Data:', mannheimChartData);
    console.log('Kaiserslautern Chart Data:', kaiserslauternChartData);

    const option = {
      title: {
        // text: 'Kinderfreundlichkeits-Indikatoren',
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
          const district = params.seriesName === 'Mannheim' ? mannheimDistrict : kaiserslauternDistrict;
          const indicators = ['Kitas', 'Grundschulen', 'Kinderärzte', 'Spielplätze', 'Kinderanteil'];
          const values = [
            district?.kitas?.toFixed(2) || 0,
            district?.grundschulen?.toFixed(2) || 0,
            district?.kinderaerzte?.toFixed(2) || 0,
            district?.spielplaetze?.toFixed(2) || 0,
            (district?.kinderanteil?.toFixed(2) || 0) + '%'
          ];

          return `
            <strong>${params.seriesName}: ${district?.name}</strong><br/>
            ${indicators[params.dataIndex]}: ${values[params.dataIndex]}<br/>
            <em>Index-Wert: ${params.value.toFixed(2)}</em>
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
            color: ['#f1f3f4', 'rgba(114, 172, 209, 0.05)']
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(110, 110, 110, 0.3)'
          }
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(175, 175, 175, 0.5)'
          }
        }
      },
      series: [
        {
          name: 'Mannheim',
          type: 'radar',
          data: [
            {
              value: mannheimChartData,
              name: mannheimDistrict.name,
              areaStyle: {
                color: 'rgba(234, 102, 102, 0.2)'
              },
              lineStyle: {
                color: '#ff4d4d',
                width: 3
              },
              itemStyle: {
                color: '#ff4d4d',
                borderColor: '#ff4d4d',
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
              value: kaiserslauternChartData,
              name: kaiserslauternDistrict.name,
              areaStyle: {
                color: 'rgba(51, 102, 255, 0.2)'
              },
              lineStyle: {
                color: '#3366ff',
                width: 3
              },
              itemStyle: {
                color:'#3366ff',
                borderColor:'#3366ff',
                borderWidth: 2
              }
            }
          ]
        }
      ]
    };

    this.chart.setOption(option, true);
    console.log('✓ Chart updated successfully');
  }
}
