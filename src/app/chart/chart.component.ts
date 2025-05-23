import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { HttpClient, HttpClientModule } from '@angular/common/http';

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
}
