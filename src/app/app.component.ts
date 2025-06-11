import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChartComponent } from "./chart/chart.component";
import { RadarChartComponent } from "./radar-chart/radar-chart.component";
import { MapComponent } from "./map/map.component";
import { CityComparisonComponent } from "./city-comparison/city-comparison.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChartComponent, RadarChartComponent, MapComponent, CityComparisonComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'quality-view';
}
