import { Pipe, PipeTransform } from '@angular/core';
import { TimeService } from './time.service';
import { UnitsService } from './units.service';

@Pipe({
  name: 'humanReadableTime',
  pure: true
})
export class HumanReadablePipe implements PipeTransform {

  constructor(
    private timeService: TimeService,
    private unitsService: UnitsService) {

  }

  transform(value: number, fromUnit: string|number, showSeconds?: boolean): string {
    if (!value) {
      return null;
    }

    value = this.unitsService.convert(value, fromUnit, 'ms');

    return this.timeService.toHumanReadable(value, showSeconds);
  }

}
