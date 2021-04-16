import { Component, OnInit, ElementRef, ViewEncapsulation, Input, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import * as d3 from 'd3';
import { UserProgressChartData, UserProgressChartDataPoint, UserProgressChartType, UserProgressChartSeries } from '../user-progress-chart-data';
import { environment } from 'src/environments/environment';
import { ChartCategory } from '../chart-category';
import { LanguageService } from 'src/app/language.service';
import { Subscription } from 'rxjs';
import { timeFormatLocale, TimeLocaleObject } from 'd3';

@Component({
    selector: 'app-user-progress-chart',
    encapsulation: ViewEncapsulation.None, // try commenting this out later
    templateUrl: './user-progress-chart.component.html',
    styleUrls: ['./user-progress-chart.component.css']
})
export class UserProgressChartComponent implements OnInit, OnChanges, OnDestroy {
    @Input() progressData: UserProgressChartData;
    @Input() width: number;

    hiddenSeries: string[] = [];
    colors = {};
    hostElement; // Native element hosting the SVG container
    showLegend = true;

    localeUS =  {
        dateTime: '%x, %X',
        date: '%-m/%-d/%Y',
        time: '%-I:%M:%S %p',
        periods: (['AM', 'PM'] as ([string, string])),
        days: (['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as [string, string, string, string, string, string, string]),
        shortDays: (['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as [string, string, string, string, string, string, string]),
        months: (['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as [string, string, string, string, string, string, string, string, string, string, string, string]),
        shortMonths: (['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as [string, string, string, string, string, string, string, string, string, string, string, string])
    };

    localePT =
    {
        dateTime: '%A, %e de %B de %Y. %X',
        date: '%d/%m/%Y',
        time: '%H:%M:%S',
        periods: (['AM', 'PM'] as ([string, string])),
        days: (['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] as [string, string, string, string, string, string, string]),
        shortDays: (['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as [string, string, string, string, string, string, string]),
        months: (['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'] as [string, string, string, string, string, string, string, string, string, string, string, string]),
        shortMonths: (['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'] as [string, string, string, string, string, string, string, string, string, string, string, string])
    };

    locale: TimeLocaleObject;
    languageChangedSubscription: Subscription;

    constructor(
        private elRef: ElementRef,
        languageService: LanguageService,
    ) {
        this.hostElement = this.elRef.nativeElement;
        this.setLocale(languageService.getLanguage());

        this.languageChangedSubscription = languageService.languageChanged.subscribe((language) => {
            this.setLocale(language);
            this.recreateChart();
        });
    }

    setLocale(language: string) {
        if (language == 'pt') {
            this.locale = d3.timeFormatLocale(this.localePT);
        }
        else {
            this.locale = d3.timeFormatLocale(this.localeUS);
        }
    }

    ngOnDestroy(): void {
        if (this.languageChangedSubscription) {
            this.languageChangedSubscription.unsubscribe();
        }
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges) {
        this.recreateChart();
    }

    recreateChart() {
        this.hiddenSeries = [];
        this.createChart();
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

    timeMultiFormat(date: Date): string {
        console.log(this.locale);
        const formatMillisecond = this.locale.format('.%L');
        const formatSecond = this.locale.format(':%S');
        const formatMinute = this.locale.format('%I:%M');
        const formatHour = this.locale.format('%I %p');
        const formatDay = this.locale.format('%a %d');
        const formatWeek = this.locale.format('%b %d');
        const formatMonth = this.locale.format('%B');
        const formatYear = this.locale.format('%Y');

        return (d3.timeSecond(date) < date ? formatMillisecond
            : d3.timeMinute(date) < date ? formatSecond
            : d3.timeHour(date) < date ? formatMinute
            : d3.timeDay(date) < date ? formatHour
            : d3.timeMonth(date) < date ? (d3.timeWeek(date) < date ? formatDay : formatWeek)
            : d3.timeYear(date) < date ? formatMonth
            : formatYear)(date);
    }

    private createChart() {
        if (!this.width || this.width <= 0) {
            return;
        }

        d3.select(this.hostElement).select('.svg-chart').select('svg').remove();

        if (!this.progressData || !this.progressData.dates || this.progressData.dates.length == 0 || 
            !this.progressData.series || this.progressData.series.length == 0) {
            return;
        }

        let margin = ({ top: 10, right: 10, bottom: 20, left: 35 });
        let height= 180;
        let width = this.width;

        const svg = d3.select(this.hostElement).select('.svg-chart').append('svg')
            .attr('viewBox', '0 0 ' + width + ' ' + height)
            .style('max-height', '300px')
            ;

        let x = d3.scaleTime()
            .domain(d3.extent<Date, Date>(this.progressData.dates, d => d))
            .range([margin.left, width - margin.right]);

        let minY = 0;
        let maxY = d3.max(this.progressData.series.flatMap(b => b.dataPoints.map(c => c.value)), d => d);

        if (this.progressData.category == ChartCategory.Weight) {
            const delta = 10;
            minY = d3.min(this.progressData.series.flatMap(b => b.dataPoints.map(c => c.value)), d => d) - delta;

            if (minY < 0) {
                minY = 0;
            }

            maxY += delta;
            this.showLegend = false;
        }
        else {
            this.showLegend = true;
        }

        let y = d3.scaleLinear()
            .domain([minY, maxY]).nice()
            .range([height - margin.bottom, margin.top])

        //const fontSize = environment.application ? 10 : 8;
        const fontSize = 12;

        let ticksX;

        if (this.progressData.category == ChartCategory.DistanceMonth) {
            const maxDays = (this.progressData.series
                    .flatMap(s => s.dataPoints
                        .flatMap(dp => dp.date.getDate())).reduce((p, c) => p > c ? p : c) );
            let nTicks = 0;

            if (maxDays <= 15) {
                nTicks = maxDays;
            }
            else {
                nTicks = width / 40;
            }

           ticksX = d3.axisBottom(x)
                .ticks(nTicks)
                //.ticks(width / 40)
                .tickSizeOuter(0)
                .tickFormat(d3.timeFormat('%-d'));
        }
        else {
            if (this.monthDiffFromArray(this.progressData.dates) > 4) {
                ticksX =
                    d3.axisBottom(x)
                    .ticks(width / 80)
                    .tickSizeOuter(0)
                    .tickFormat((date) => {
                    if (date instanceof Date) {
                        if (d3.timeYear(date) < date) {
                            return this.locale.format('%b')(date);
                        } else {
                            return this.locale.format('%Y')(date);
                        }
                    }
                });
            }
            else {
                ticksX =
                    d3.axisBottom(x)
                    .ticks(width / 80)
                    .tickSizeOuter(0)
                    .tickFormat((date) => this.timeMultiFormat(date as Date));
            }
        }

        let xAxis = g => g
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(
                ticksX
                )
            .call(g => g.selectAll('.tick text')
                .attr('font-size', fontSize)
                .attr('font-family', '\'Roboto\', \'sans-serif\'')
                );

        let yAxis = g => g
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisRight(y)
                .tickSize(width - margin.left - margin.right))
            .call(g => g.select('.domain')
                .remove())
            .call(g => g.selectAll('.tick:not(:first-of-type) line')
                .attr('stroke-opacity', 0.5)
                .attr('stroke-dasharray', '2,2'))
            .call(g => g.selectAll('.tick text').remove())
            ;

        let yAxis2 = g => g
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        // .call(d3.axisLeft(y).tickFormat((d, i) => d.toLocaleString())) // <- produces weird results on the pt locale (like 1 - 1,5 - 2 - 2,5 and it gets uneven)
        .call(g => g.select('.domain').remove())
        .call(g => g.selectAll('.tick text').attr('font-size', fontSize).attr('font-family', '\'Roboto\', \'sans-serif\''))
        .call(g => g.selectAll('.tick line').attr('display', 'none'))
            .call(g => g.select('.tick:last-of-type')
            .append('rect')
            .attr('x', 0)
            .attr('y', -10)
            .attr('width', 16)
            .attr('height', 20)
            .attr('fill', 'white')
            .lower()
            )
            .call(g => g.select('.tick:last-of-type text').clone()
            .attr('x', 0)
            .attr('font-size', fontSize)
            .attr('text-anchor', 'start')
            .attr('font-weight', 'bold')
            .attr('font-family', '\'Roboto\', \'sans-serif\'')
            .text(this.progressData.unitCode ?? '')
            )
        ;

        svg.append('g')
        .call(xAxis);

        if (this.progressData.type == UserProgressChartType.Line) {
            svg.append('g')
            .call(yAxis);
        }

        svg.append('g')
        .call(yAxis2);

        let drawElement;
        
        if (this.progressData.type == UserProgressChartType.Line) {
            drawElement = d3.line<UserProgressChartDataPoint>()
                .defined(d => !isNaN(d.value))
                .x(d => x(d.date))
                .y(d => y(d.value));
        }
        else if (this.progressData.type == UserProgressChartType.Area) {
            drawElement = d3.area<UserProgressChartDataPoint>()
                .curve(d3.curveLinear)
                .defined(d => !isNaN(d.value))
                .x(d => x(d.date))
                .y0(y(0))
                .y1(d => y(d.value));
        }

        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        var divTooltip = d3.select(this.hostElement).select('.svg-chart')
        .append('div')
        .style('opacity', 0)
        .attr('class', 'chart-tooltip');

        this.progressData.series
            .forEach((series, index) => {
                let color = colorScale('' + index);
                this.colors[series.name] = color;

                if (!this.isHidden(series)) {
                    if (this.progressData.type == UserProgressChartType.Area) {
                        svg
                            .append('path')
                            .datum(series.dataPoints)
                            .attr('fill', this.progressData.type == UserProgressChartType.Area ? color : 'none')
                            .attr('opacity', 0.5)
                            .attr('d', drawElement);
                    }
                    else {
                        svg
                            .append('path')
                            .datum(series.dataPoints)
                            .attr('fill', 'none')
                            .attr('stroke', color)
                            .attr('stroke-width', 1)
                            .attr('stroke-linejoin', 'round')
                            .attr('stroke-linecap', 'round')
                            .attr('d', drawElement);
                    }

                    function onMouseOver(d) {
                        divTooltip.transition()
                            .duration(200)
                            .style('opacity', .9);

                        divTooltip.html(series.name + ' - ' + d.value)
                            .attr('text-anchor', 'middle')
                            .style('left', (d3.event.pageX) + 'px')
                            .style('top', (d3.event.pageY - 28) + 'px');
                    }

                    function onMouseOut(d) {
                        divTooltip.transition()
                            .duration(250)
                            .style('opacity', 0);
                    }

                    if (this.progressData.type == UserProgressChartType.Line) {
                        let dotGroup = svg.selectAll('.dot')
                            .data(series.dataPoints)
                            .enter()
                            .append('g');
                        dotGroup
                            .append('circle') // Uses the enter().append() method
                            .attr('fill', color)
                            .attr('stroke', color)
                            .attr('cx', function (d, i) { return x(d.date) })
                            .attr('cy', function (d) { return y(d.value) })
                            .attr('r', 1.5)
                            .on('mouseover', onMouseOver)
                            .on('mouseout', onMouseOut)
                            ;
                    }
                }
            });

        return svg.node();
    }

    monthDiffFromArray(dates: Date[]) {
        if (!dates || dates.length <= 1) {
            return 0;
        }

        const minDate = new Date(Math.min.apply(null, dates));
        const maxDate = new Date(Math.max.apply(null, dates));

        return this.monthDiff(minDate, maxDate);
    }

    monthDiff(dateFrom, dateTo) {
        return dateTo.getMonth() - dateFrom.getMonth() + 
            (12 * (dateTo.getFullYear() - dateFrom.getFullYear()))
    }
}
