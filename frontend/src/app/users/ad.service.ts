import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdService {

  constructor(private authService: AuthService) { }

  adsVisible() {
    // if (this.authService.userIsStaff()) {
    //   return false;
    // }

    if (!environment.showAds) {
      return false;
    }

    if (this.authService.getUserTier() == null || 
      this.authService.getUserTier() == 'n') {
        return true;
    }

    return false;
  }
}
