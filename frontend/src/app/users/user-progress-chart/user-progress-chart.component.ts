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
        d3.select(this.hostElement).select('.svg-chart').select('svg').remove();

        if (!this.progressData) {
            return;
        }

        let margin = ({ top: 20, right: 20, bottom: 20, left: 30 });
        let height = 330;
        let width = 330;

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
            .call(
                d3.axisBottom(x)
                .ticks(width / 80)
                .tickSizeOuter(0)
                )
            .call(g => g.selectAll(".tick text")
                .attr("font-size", 6)
                );

        let yAxis = g => g
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisRight(y)
                .tickSize(width - margin.left - margin.right))
            .call(g => g.select(".domain")
                .remove())
            .call(g => g.selectAll(".tick:not(:first-of-type) line")
                .attr("stroke-opacity", 0.5)
                .attr("stroke-dasharray", "2,2"))
            .call(g => g.selectAll(".tick text").remove())
            ;

        let yAxis2 = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick text").attr("font-size", 6))
        .call(g => g.selectAll(".tick line").attr("display", "none"))
        ;

        svg.append("g")
        .call(xAxis);

        svg.append("g")
        .call(yAxis);

        svg.append("g")
        .call(yAxis2);

        let line = d3.line<UserProgressDataPoint>()
            .defined(d => !isNaN(d.weight))
            .x(d => x(d.date))
            .y(d => y(d.weight))

        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        var Tooltip = d3.select(this.hostElement).select('.svg-chart')
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

        var mouseover = function(d) {
            Tooltip
            .style("opacity", 1)
        }

        var mousemove = function(d) {
            Tooltip
            .html("Exact value: " + d.weight)
            .style("left", x(d.date) + "px")
            .style("top", y(d.weight) + "px")
        }
        var mouseleave = function(d) {
            Tooltip
            .style("opacity", 0)
        }

        this.progressData.series.forEach((series, index) => {
            let color = colorScale('' + index);
            this.colors[series.exercise.name] = color;

            svg
                .append("path")
                .datum(series.dataPoints)
                .attr("fill", "none")
                .attr("stroke", color)
                .attr("stroke-width", 1)
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
                .attr("r", 1.5)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)

            dotGroup
                .append("text")
                  .attr("font-family", "sans-serif")
                  .attr("font-size", 10)
                .attr("x", function (d, i) { return x(d.date) })
                .attr("y", function (d) { return y(d.weight) })
                    .attr("text-anchor", "middle")
                    .text(d => d.weight)
                    //.attr("text", d => d.weight)
                ;

        });

        return svg.node();
    }

}
