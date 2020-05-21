import { Component, OnInit, ElementRef, ViewEncapsulation, Input, SimpleChanges, OnChanges } from '@angular/core';
import { UnitsService } from '../units.service';
import * as d3 from 'd3';
import { UserProgressData, UserProgressDataPoint, UserProgressSeries } from '../user-progress-data';

@Component({
    selector: 'app-user-progress-chart',
    encapsulation: ViewEncapsulation.None, // try commenting this out later
    templateUrl: './user-progress-chart.component.html',
    styleUrls: ['./user-progress-chart.component.css']
})
export class UserProgressChartComponent implements OnInit, OnChanges {
    @Input() progressData: UserProgressData;

    colors = {};
    hostElement; // Native element hosting the SVG container

    constructor(
        private elRef: ElementRef,
        private unitsService: UnitsService,
    ) {
        this.hostElement = this.elRef.nativeElement;
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.progressData) {
            this.createChart();
        }
    }

    private createChart() {
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        if (!this.progressData) {
            return;
        }

        let margin = ({ top: 40, right: 40, bottom: 40, left: 40 })
        let height = 500
        let width = 500

        d3.select(this.hostElement).select('.svg-chart').select('svg').remove();

        const svg = d3.select(this.hostElement).select('.svg-chart').append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', '0 0 ' + width + ' ' + height);

        let x = d3.scaleUtc()
        .domain(d3.extent<Date, Date>(this.progressData.dates, d => d))
        .range([margin.left, width - margin.right])

        let y = d3.scaleLinear()
        .domain([0, d3.max(this.progressData.series.flatMap(b => b.dataPoints.map(c => c.weight)), d => d)]).nice()
        .range([height - margin.bottom, margin.top])

        let xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))

        let yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
              .attr("x", 3)
              .attr("text-anchor", "start")
              .attr("font-weight", "bold")
              .text(this.unitsService.getUserWeightUnitCode()))

              let line = d3.line<UserProgressDataPoint>()
              .defined(d => !isNaN(d.weight))
              .x(d => x(d.date))
              .y(d => y(d.weight))

              svg.append("g")
              .call(xAxis);

              svg.append("g")
              .call(yAxis);


              this.progressData.series.forEach((series, index) => {
                  let color = colorScale('' + index);
                  this.colors[series.exercise.name] = color;

                  svg
                  .append("path")
                  .datum(series.dataPoints)
                  .attr("fill", "none")
                  .attr("stroke", color)
                  .attr("stroke-width", 1.5)
                  .attr("stroke-linejoin", "round")
                  .attr("stroke-linecap", "round")
                  .attr("d", line);
              })

              return svg.node();
    }
}
