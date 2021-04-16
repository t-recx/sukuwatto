import { Component, OnInit, Input, ElementRef, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import * as d3 from 'd3';
import { PieChartSeries } from '../pie-chart-series';
import { UserProgressChartData } from '../user-progress-chart-data';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/language.service';
import { combineLatest, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css']
})
export class PieChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() progressData: UserProgressChartData;
  @Input() width;
  data: PieChartSeries[];

  hostElement; // Native element hosting the SVG container

  languageChangedSubscription: Subscription;

  originalNames: string[] = [];

  constructor(
    private elRef: ElementRef,
    private translate: TranslateService,
    private languageService: LanguageService,
  ) {
    this.hostElement = this.elRef.nativeElement;

    this.languageChangedSubscription = languageService.languageChanged.subscribe(language => {
      this.createChart();
    });
  }

  ngOnDestroy(): void {
    if (this.languageChangedSubscription) {
      this.languageChangedSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.setOriginalNames();
    this.createChart();
  }

  setOriginalNames() {
    this.originalNames = [];

    if (this.progressData) {
      this.originalNames.push(this.progressData.name);

      if (this.progressData.series) {
        this.progressData.series.forEach(series => {
          series.dataPoints.forEach(dp => {
            this.originalNames.push(dp.name);
          });
        });
      }
    }
  }

  createChart() {
    const obs: Observable<string>[] = [];
    if (this.originalNames) {
      this.originalNames.forEach(n => {
        obs.push(this.translate.get(n));
      });

      combineLatest(obs).subscribe(x => {
        let counter = 0;
        this.progressData.name = x[counter++];

        if (this.progressData.series) {
          this.progressData.series.forEach(series => {
            series.dataPoints.forEach(dp => {
              dp.name = x[counter++];
            });
          });
        }

        this._createChart();
      });
    }
  }

  private arcLabel(width, height) {
    const radius = Math.min(width, height) / 2 * 0.6;
    return d3.arc().innerRadius(radius).outerRadius(radius);
  }

  private convertData() {
    if (this.progressData && this.progressData.series.length > 0) {
      this.data = this.progressData.series[0].dataPoints.map(x => new PieChartSeries(x.name, x.value));
    }
    else {
      this.data = null;
    }
  }

  private _createChart() {
    if (!this.width || this.width <= 0) {
      return;
    }

    d3.select(this.hostElement).select('.svg-chart').select('svg').remove();

    this.convertData();

    if (!this.data) {
      return;
    }

    let size = this.width;

    if (size > 300) {
      size = 300;
    }

    let width = size;
    let height = size;

    let color = d3.scaleOrdinal<string>()
      .domain(this.data.map(d => d.name))
      .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), this.data.length).reverse())

    let arc = d3.arc()
      .innerRadius(0)
      .outerRadius(Math.min(width, height) / 2 - 1);

    let pie = d3.pie<PieChartSeries>()
      .sort(null)
      .value(d => d.value)

    const arcs = pie(this.data);

    const svg = d3.select(this.hostElement).select('.svg-chart').append('svg')
      .attr("viewBox", `${-width / 2}, ${-height / 2}, ${width}, ${height}`)
      .style('max-height', '300px')
      ;

    svg.append("g")
      .attr("stroke", "white")
      .attr("stroke-width", "2")
      .selectAll("path")
      .data(arcs)
      .join("path")
      .attr("fill", d => color(d.data.name))
      .attr("d", <any>arc)
      .append("title")
      .text(d => `${d.data.name}: ${d.data.value.toLocaleString()}%`);

    
    const fontSize = 12;

    svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", fontSize)
      .attr("text-anchor", "middle")
      .selectAll("text")
      .data(arcs)
      .join("text")
      .attr("transform", d => `translate(${this.arcLabel(width, height).centroid(<any>d)})`)
      .call(text => text.append("tspan")
        .attr("y", "-0.4em")
        .attr("font-weight", "bold")
        .text(d => d.data.name))
      .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
        .attr("x", 0)
        .attr("y", "0.7em")
        .attr("fill-opacity", 0.7)
        .text(d => d.data.value.toLocaleString() + "%"));

    return svg.node();
  }
}
