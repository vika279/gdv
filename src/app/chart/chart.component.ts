import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as echarts from 'echarts';
import germanyMap from '../../assets/data/germany.json';


@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule, HttpClientModule],
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent {
  data: any[] = [];
  barOptions: any = {};
  radarOptions: any = {};
  showRadar = false;

  constructor(private http: HttpClient) {
    this.loadData();
  }

  ngOnInit() {
    echarts.registerMap('Germany', germanyMap as any);
  }

  loadData() {
    this.http.get<any[]>('assets/data/test.json').subscribe(data => {
      this.data = data;

      const xAxisData = data.map(d => d.name);
      const seriesData = data.map(d => d.Indicator1);

      this.barOptions = {
        title: { text: 'Balkendiagramm: Indicator1' },
        tooltip: {},
        xAxis: { type: 'category', data: xAxisData },
        yAxis: { type: 'value' },
        series: [
          {
            type: 'bar',
            data: seriesData,
            itemStyle: { color: '#56A3F1' }
          }
        ]
      };
    });
  }

  onBarClick(event: any) {
    const name = event.name; // z.B. 'Data A'
    const selected = this.data.find(d => d.name === name);
    if (!selected) return;

    // Radar-Indikatoren definieren (ohne Name)
    const indicators = Object.keys(selected)
      .filter(key => key !== 'name')
      .map(key => ({
        name: key,
        // max-Werte kannst du dynamisch bestimmen oder statisch setzen
        max: this.getMaxForIndicator(key)
      }));

    // Werte in der Reihenfolge der Indikatoren
    const values = indicators.map(ind => selected[ind.name] ?? 0);

    this.radarOptions = {
      title: { text: `Radar Chart für ${name}` },
      tooltip: {},
      radar: {
        indicator: indicators
      },
      series: [{
        type: 'radar',
        data: [
          {
            value: values,
            name: name
          }
        ]
      }]
    };

    this.showRadar = true;
  }

  getMaxForIndicator(indicator: string): number {
    // Beispiel: maximaler Wert für jeden Indikator aus allen Daten
    return Math.max(...this.data.map(d => d[indicator] ?? 0)) * 1.2; // 20% Puffer
  }
  loadMapChart(myChart: any) {
  const populationData = [
    { name: 'Berlin', value: 4090 },
    { name: 'Bremen', value: 1680 },
    { name: 'Hamburg', value: 2440 },
    { name: 'Nordrhein-Westfalen', value: 530 },
    { name: 'Saarland', value: 380 },
    { name: 'Baden-Württemberg', value: 310 },
    { name: 'Hessen', value: 300 },
    { name: 'Sachsen', value: 220 },
    { name: 'Rheinland-Pfalz', value: 210 },
    { name: 'Schleswig-Holstein', value: 180 },
    { name: 'Niedersachsen', value: 170 },
    { name: 'Thüringen', value: 130 },
    { name: 'Brandenburg', value: 85 },
    { name: 'Sachsen-Anhalt', value: 110 },
    { name: 'Bayern', value: 180 },
    { name: 'Mecklenburg-Vorpommern', value: 70 }
  ];

  myChart.setOption({
    title: {
      text: 'Bevölkerungsdichte in Deutschland (2025)',
      subtext: 'Datenquelle: Statistisches Bundesamt',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}<br/>{c} Einwohner/km²'
    },
    visualMap: {
      min: 50,
      max: 4500,
      left: 'left',
      top: 'bottom',
      text: ['Hoch', 'Niedrig'],
      calculable: true,
      inRange: {
        color: ['#e0f3f8', '#abd9e9', '#74add1', '#4575b4']
      }
    },
    series: [
      {
        name: 'Bevölkerungsdichte',
        type: 'map',
        map: 'Germany',
        roam: true,
        label: {
          show: true
        },
        data: populationData
      }
    ]
  });
}
}
