import { Component, OnInit, ElementRef, ViewEncapsulation, Input, SimpleChanges, OnChanges } from '@angular/core';
import * as d3 from 'd3';
import { UserProgressChartData, UserProgressChartDataPoint, UserProgressChartType, UserProgressChartSeries } from '../user-progress-chart-data';

@Component({
  selector: 'app-user-finish-workout-progress-chart',
  templateUrl: './user-finish-workout-progress-chart.component.html',
  styleUrls: ['./user-finish-workout-progress-chart.component.css']
})
export class UserFinishWorkoutProgressChartComponent implements OnInit {
    @Input() progressData: UserProgressChartData;

    hiddenSeries: string[] = [];
    colors = {};
    hostElement; // Native element hosting the SVG container

    constructor(
        private elRef: ElementRef,
    ) {
        this.hostElement = this.elRef.nativeElement;
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.progressData) {
            this.hiddenSeries = [];
            this.createChart();
        }
    }

    toggle(series: UserProgressChartSeries): void {
        if (this.isHidden(series)) {
            this.hiddenSeries = this.hiddenSeries.filter(name => name != series.name);
        }
        else {
            this.hiddenSeries.push(series.name);
        }

        this.createChart();
    }

    isHidden(series: UserProgressChartSeries): boolean {
        return this.hiddenSeries.filter(name => series.name == name).length > 0;
    }

    private createChart() {
        d3.select(this.hostElement).select('.svg-chart').select('svg').remove();

        if (!this.progressData) {
            return;
        }

        let margin = ({ top: 5, right: 15, bottom: 5, left: 15 });
        let width= 270 ;
        let height= 128 + 80 ;
        let viewBoxWidth = width;
        let viewBoxHeight = height;

        const svg = d3.select(this.hostElement).select('.svg-chart').append('svg')
            .attr('viewBox', '0 0 ' + viewBoxWidth + ' ' + viewBoxHeight)
            //.style('overflow', 'visible')
            .attr('width', width)
          .attr('height', height)
            ;

        let x = d3.scaleUtc()
            .domain(d3.extent<Date, Date>(this.progressData.dates, d => d))
            .range([margin.left, width - margin.right])

        const delta = 5;

        let min = d3.min(this.progressData.series.flatMap(b => b.dataPoints.map(c => c.weight)), d => d) - delta;

        if (min < 0) {
          min = 0;
        }

        let max = d3.max(this.progressData.series.flatMap(b => b.dataPoints.map(c => c.weight)), d => d) + delta;

        let y = d3.scaleLinear()
            .domain([
              min, max]).nice()
            .range([height - margin.bottom, margin.top])

        let line = d3.line<UserProgressChartDataPoint>()
            .defined(d => !isNaN(d.weight))
            .x(d => x(d.date))
            .y(d => y(d.weight))

        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        this.progressData.series
            .forEach((series, index) => {
                let color = colorScale('' + index);
                this.colors[series.name] = color;

                if (!this.isHidden(series)) {
                    svg
                        .append("path")
                        .datum(series.dataPoints)
                        .attr("fill", "none")
                        .attr("stroke", color)
                        .attr("stroke-width", 4)
                        .attr("stroke-linejoin", "round")
                        .attr("stroke-linecap", "round")
                        .attr("d", line)

                    let dotGroup = svg.selectAll(".dot")
                        .data(series.dataPoints)
                        .enter()
                        .append("g");

                    dotGroup
                        .append("circle") // Uses the enter().append() method
                        .attr('fill', color)
                        .attr('stroke', color)
                        .attr("cx", function (d, i) { return x(d.date) })
                        .attr("cy", function (d) { return y(d.weight) })
                        .attr("r", 6)
                        ;

                    dotGroup
                      .selectAll(".dot")
                      .data([series.dataPoints.sort((a,b) => b.date.getTime() - a.date.getTime())[0]])
                      .enter()
                      .append("circle")
	                    .attr("fill-opacity","0.0")
	                    .style("fill","White")
                        .attr('stroke', color)
                        .attr("stroke-width", 4)
                        .attr("cx", function (d, i) { return x(d.date) })
                        .attr("cy", function (d) { return y(d.weight) })
                        .attr("r", 12)
                        ;
                }
            });

        return svg.node();
    }
}
