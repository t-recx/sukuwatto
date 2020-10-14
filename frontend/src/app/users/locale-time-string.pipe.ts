import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'localeTime'
})
export class LocaleTimeStringPipe implements PipeTransform {

  transform(value: Date): string {
    if (value == null) {
      return null;
    }

    return value.toLocaleTimeString();
  }

}
