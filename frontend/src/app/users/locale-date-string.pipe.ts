import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'localeDate',
  pure: true
})
export class LocaleDateStringPipe implements PipeTransform {

  transform(value: Date): string {
    if (value == null) {
      return null;
    }

    return value.toLocaleDateString();
  }

}
