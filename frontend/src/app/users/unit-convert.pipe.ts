import { Pipe, PipeTransform } from '@angular/core';
import { Unit } from './unit';
import { UnitsService } from './units.service';

@Pipe({
  name: 'unitConvert'
})
export class UnitConvertPipe implements PipeTransform {

  constructor(private unitsService : UnitsService) {
  }

  transform(value: any, fromUnit: Unit|string): any {
    return this.unitsService.convert(value, fromUnit);
  }
}
