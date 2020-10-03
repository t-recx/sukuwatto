import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'locale',
  pure: true
})
export class LocaleStringPipe implements PipeTransform {

  transform(value: number): string {
    if (value == null) {
      return null;
    }

    return value.toLocaleString();
  }

}
