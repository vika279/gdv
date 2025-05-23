import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';

@Component({
  selector: 'app-radar-chart',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule, HttpClientModule],
  template: `<div echarts [options]="chartOption" class="chart" style="height: 500px;"></div>`,
})
export class RadarChartComponent {
  chartOption: echarts.EChartsOption = {
    title: { text: 'Loading data...' },
    legend: {},
    radar: [],
    series: []
  };

  constructor(private http: HttpClient) {
    this.loadJsonData();
  }

  loadJsonData() {
    this.http.get<any[]>('assets/data/test.json').subscribe(data => {
      this.buildChartOptions(data);
    });
  }

  buildChartOptions(data: any[]) {
    const keys = Object.keys(data[0]).filter(k => k !== 'name');

    const radarIndicators = keys.map(key => ({
      text: key,
      max: Math.max(...data.map(row => row[key] || 0)) || 100
    }));

    const seriesData = data.map(row => ({
      name: row.name,
      value: keys.map(k => row[k] ?? 0)
    }));

    this.chartOption = {
      title: { text: 'Radar Chart from JSON' },
      legend: { data: data.map(d => d.name) },
      radar: [{
        indicator: radarIndicators,
        radius: 120,
        shape: 'circle',
      }],
      series: [{
        type: 'radar',
        data: seriesData
      }]
    };
  }
}
