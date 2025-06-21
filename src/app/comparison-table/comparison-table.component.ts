import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { District } from '../app.component';

@Component({
  selector: 'app-comparison-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-container">
      <table class="comparison-table">
        <thead>
          <tr>
            <th class="indicator-column">Indikator</th>
            <th class="city-column mannheim">
              {{ displayMannheimDistrict.name }}
              <div class="city-label">Mannheim</div>
            </th>
            <th class="city-column kaiserslautern">
              {{ displayKaiserslauternDistrict.name }}
              <div class="city-label">Kaiserslautern</div>
            </th>
            <th class="difference-column">Differenz</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="indicator-name">
              <span class="icon">🏠</span>
              <span>Kindertagesstätten</span>
            </td>
            <td class="value mannheim">{{ displayMannheimDistrict.kitas }}</td>
            <td class="value kaiserslautern">{{ displayKaiserslauternDistrict.kitas }}</td>
            <td class="difference" [ngClass]="getDifferenceClass('kitas')">
              {{ getDifference('kitas') }}
              <span class="difference-indicator">{{ getDifferenceIndicator('kitas') }}</span>
            </td>
          </tr>

          <tr>
            <td class="indicator-name">
              <span class="icon">🏫</span>
              <span>Grundschulen</span>
            </td>
            <td class="value mannheim">{{ displayMannheimDistrict.grundschulen }}</td>
            <td class="value kaiserslautern">{{ displayKaiserslauternDistrict.grundschulen }}</td>
            <td class="difference" [ngClass]="getDifferenceClass('grundschulen')">
              {{ getDifference('grundschulen') }}
              <span class="difference-indicator">{{ getDifferenceIndicator('grundschulen') }}</span>
            </td>
          </tr>

          <tr>
            <td class="indicator-name">
              <span class="icon">⚕️</span>
              <span>Kinderärzte</span>
            </td>
            <td class="value mannheim">{{ displayMannheimDistrict.kinderaerzte }}</td>
            <td class="value kaiserslautern">{{ displayKaiserslauternDistrict.kinderaerzte }}</td>
            <td class="difference" [ngClass]="getDifferenceClass('kinderaerzte')">
              {{ getDifference('kinderaerzte') }}
              <span class="difference-indicator">{{ getDifferenceIndicator('kinderaerzte') }}</span>
            </td>
          </tr>

          <tr>
            <td class="indicator-name">
              <span class="icon">🛝</span>
              <span>Spielplätze</span>
            </td>
            <td class="value mannheim">{{ displayMannheimDistrict.spielplaetze }}</td>
            <td class="value kaiserslautern">{{ displayKaiserslauternDistrict.spielplaetze }}</td>
            <td class="difference" [ngClass]="getDifferenceClass('spielplaetze')">
              {{ getDifference('spielplaetze') }}
              <span class="difference-indicator">{{ getDifferenceIndicator('spielplaetze') }}</span>
            </td>
          </tr>

          <tr>
            <td class="indicator-name">
              <span class="icon">👶</span>
              <span>Kinderanteil (0-10 Jahre)</span>
            </td>
            <td class="value mannheim">{{ displayMannheimDistrict.kinderanteil }}%</td>
            <td class="value kaiserslautern">{{ displayKaiserslauternDistrict.kinderanteil }}%</td>
            <td class="difference" [ngClass]="getDifferenceClass('kinderanteil')">
              {{ getDifference('kinderanteil') }}%
              <span class="difference-indicator">{{ getDifferenceIndicator('kinderanteil') }}</span>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="index-row">
            <td class="indicator-name">
              <span class="icon">📊</span>
              <span><strong>Gesamtindex</strong></span>
            </td>
            <td class="value mannheim index-value">
              <span class="index-score">{{ displayMannheimDistrict.index }}/5</span>
            </td>
            <td class="value kaiserslautern index-value">
              <span class="index-score">{{ displayKaiserslauternDistrict.index }}/5</span>
            </td>
            <td class="difference index-difference" [ngClass]="getDifferenceClass('index')">
              {{ getDifference('index') }}
              <span class="difference-indicator">{{ getDifferenceIndicator('index') }}</span>
            </td>
          </tr>
        </tfoot>
      </table>

      <div class="summary-stats">
        <div class="stat-card mannheim">
          <h4>{{ displayMannheimDistrict.name }}</h4>
          <div class="stat-value">{{ displayMannheimDistrict.index }}/5</div>
          <div class="stat-label">Kinderfreundlichkeit</div>
          <div class="stat-details">
            <span>{{ getTotalFacilities(displayMannheimDistrict) }} Einrichtungen</span>
          </div>
        </div>

        <div class="stat-card kaiserslautern">
          <h4>{{ displayKaiserslauternDistrict.name }}</h4>
          <div class="stat-value">{{ displayKaiserslauternDistrict.index }}/5</div>
          <div class="stat-label">Kinderfreundlichkeit</div>
          <div class="stat-details">
            <span>{{ getTotalFacilities(displayKaiserslauternDistrict) }} Einrichtungen</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table-container {
      width: 100%;
      overflow-x: auto;
    }

    .comparison-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      font-size: 0.9rem;
    }

    .comparison-table th,
    .comparison-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #e9ecef;
    }

    .comparison-table thead th {
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      font-weight: 600;
      color: #495057;
      position: relative;
    }

    .indicator-column {
      width: 35%;
      font-weight: bold;
    }

    .city-column {
      width: 20%;
      text-align: center;
      color: white;
      font-weight: 600;
    }

    .city-column.mannheim {
      background: linear-gradient(135deg, #667eea, #764ba2);
    }

    .city-column.kaiserslautern {
      background: linear-gradient(135deg, #f093fb, #f5576c);
    }

    .city-label {
      font-size: 0.75rem;
      opacity: 0.9;
      margin-top: 2px;
    }

    .difference-column {
      width: 25%;
      text-align: center;
      font-weight: 600;
    }

    .indicator-name {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .icon {
      font-size: 1.1rem;
    }

    .value {
      text-align: center;
      font-weight: 600;
      padding: 16px;
    }

    .value.mannheim {
      background: rgba(102, 126, 234, 0.1);
      color: #4c63d2;
    }

    .value.kaiserslautern {
      background: rgba(240, 147, 251, 0.1);
      color: #d63384;
    }

    .difference {
      text-align: center;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }

    .difference.positive {
      color: #28a745;
    }

    .difference.negative {
      color: #dc3545;
    }

    .difference.neutral {
      color: #6c757d;
    }

    .difference-indicator {
      font-size: 1.2rem;
    }

    .index-row {
      background: #f8f9fa;
      font-weight: bold;
    }

    .index-value {
      position: relative;
    }

    .index-score {
      font-size: 1.1rem;
      font-weight: bold;
    }

    .index-difference {
      font-size: 1.1rem;
    }

    .summary-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 25px;
    }

    .stat-card {
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      color: white;
      position: relative;
      overflow: hidden;
    }

    .stat-card.mannheim {
      background: linear-gradient(135deg, #667eea, #764ba2);
    }

    .stat-card.kaiserslautern {
      background: linear-gradient(135deg, #f093fb, #f5576c);
    }

    .stat-card h4 {
      margin: 0 0 10px 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: bold;
      margin: 10px 0;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    .stat-label {
      font-size: 0.9rem;
      opacity: 0.9;
      margin-bottom: 8px;
    }

    .stat-details {
      font-size: 0.8rem;
      opacity: 0.8;
    }

    @media (max-width: 768px) {
      .comparison-table {
        font-size: 0.8rem;
      }

      .comparison-table th,
      .comparison-table td {
        padding: 8px 12px;
      }

      .summary-stats {
        grid-template-columns: 1fr;
        gap: 15px;
      }

      .stat-value {
        font-size: 2rem;
      }
    }

    @media (max-width: 600px) {
      .indicator-column {
        width: 40%;
      }

      .city-column {
        width: 18%;
      }

      .difference-column {
        width: 24%;
      }

      .indicator-name span:last-child {
        display: none;
      }

      .icon {
        font-size: 1.2rem;
      }
    }
  `]
})
export class ComparisonTableComponent {
  @Input() mannheimDistrict: District | null = null;
  @Input() kaiserslauternDistrict: District | null = null;

  // Default-Werte für Gesamtdaten
  private defaultMannheimDistrict: District = {
    name: 'Gesamt',
    kitas: 23,
    grundschulen: 1,
    kinderaerzte: 2,
    spielplaetze: 2,
    kinderanteil: 0.13,
    index: 2.1,
    id: '',
    city: '',
 coordinates: [49.4875, 8.4660],
    color: '',
    kitasIndex: 0,
    grundschulenIndex: 0,
    kinderaerzteIndex: 0,
    spielplaetzeIndex: 0,
    gesamt_kinder: 0,
    kinder_0_6: 0,
    kinder_6_10: 0,
    kinderanteilIndex: 0,
    gesamt_Einwohner: 0,
    avg_index: 0
  };

  private defaultKaiserslauternDistrict: District = {
    name: 'Gesamt',
    kitas: 9,
    grundschulen: 2,
    kinderaerzte: 3,
    spielplaetze: 0,
    kinderanteil: 0.05,
    index: 1.4,
    id: '',
    city: '',
  coordinates: [49.4401, 7.7491],
    color: '',
    kitasIndex: 0,
    grundschulenIndex: 0,
    kinderaerzteIndex: 0,
    spielplaetzeIndex: 0,
    gesamt_kinder: 0,
    kinder_0_6: 0,
    kinder_6_10: 0,
    kinderanteilIndex: 0,
    gesamt_Einwohner: 0,
    avg_index: 0
  };

  // Getter für die anzuzeigenden Daten
  get displayMannheimDistrict(): District {
    return this.mannheimDistrict || this.defaultMannheimDistrict;
  }

  get displayKaiserslauternDistrict(): District {
    return this.kaiserslauternDistrict || this.defaultKaiserslauternDistrict;
  }

  getDifference(indicator: keyof District): string {
    const mannheimValue = this.displayMannheimDistrict[indicator] as number;
    const kaiserslauternValue = this.displayKaiserslauternDistrict[indicator] as number;
    const diff = mannheimValue - kaiserslauternValue;

    if (diff > 0) {
      return `+${diff.toFixed(indicator === 'kinderanteil' ? 2 : 0)}`;
    } else if (diff < 0) {
      return diff.toFixed(indicator === 'kinderanteil' ? 2 : 0);
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
