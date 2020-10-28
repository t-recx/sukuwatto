import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Feature } from '../feature';
import { Location } from '@angular/common';
import { FeaturesService } from '../features.service';
import { LoadingService } from '../loading.service';

@Component({
  selector: 'app-feature-detail',
  templateUrl: './feature-detail.component.html',
  styleUrls: ['./feature-detail.component.css']
})
export class FeatureDetailComponent implements OnInit, OnDestroy {
  id: number;

  notFound = false;
  feature: Feature = null;
  paramChangedSubscription: Subscription;

  constructor(
    private router: Router,
    route: ActivatedRoute,
    private location: Location,
    private featuresService: FeaturesService,
    private loadingService: LoadingService,
  ) {
    this.paramChangedSubscription = route.paramMap.subscribe(val => {
      this.loadParameterDependentData(val.get('id'));
    });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.paramChangedSubscription.unsubscribe();
  }

  loadParameterDependentData(id: string) {
    this.notFound = false;
    this.loadingService.load();
    this.id = +id;

    this.featuresService.getFeature(this.id).subscribe(feature => {
      this.feature = feature;

      if (!this.feature) {
        this.notFound = true;
      }
      this.loadingService.unload();
    });
  }

  featureDeleted(feature: Feature) {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}
