import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChartComponent } from "./chart/chart.component";
import { RadarChartComponent } from "./radar-chart/radar-chart.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChartComponent, RadarChartComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'quality-view';
}
