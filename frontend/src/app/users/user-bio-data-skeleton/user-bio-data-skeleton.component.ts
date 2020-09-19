import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth.service';
import { CordovaService } from 'src/app/cordova.service';
import { SerializerUtilsService } from 'src/app/serializer-utils.service';
import { VisibilityLabel } from 'src/app/visibility';
import { MeasurementType, Unit } from '../unit';
import { UnitsService } from '../units.service';
import { UserBioData } from '../user-bio-data';
import { UserBioDataService } from '../user-bio-data.service';

@Component({
  selector: 'app-user-bio-data-skeleton',
  templateUrl: './user-bio-data-skeleton.component.html',
  styleUrls: ['./user-bio-data-skeleton.component.css']
})
export class UserBioDataSkeletonComponent implements OnInit, OnChanges, OnDestroy {
  @Input() userBioData: UserBioData;
  @Input() triedToSave: boolean;

  units: Unit[];
  weightUnits: Unit[];
  heightUnits: Unit[];

  defaultWeightUnit: number = null;
  defaultHeightUnit: number = null;

  pausedSubscription: Subscription;

  visibilityLabel = VisibilityLabel;
  faEye = faEye;

  constructor(
    private service: UserBioDataService,
    private authService: AuthService,
    private unitsService: UnitsService,
    private cordovaService: CordovaService,
    private serializerUtils: SerializerUtilsService,
  ) { }

  ngOnDestroy(): void {
    this.pausedSubscription.unsubscribe();

    localStorage.removeItem('state_user_bio_data_has_state');
    localStorage.removeItem('state_user_bio_data_user_bio_data');
  }

  ngOnInit(): void {
    this.pausedSubscription = this.cordovaService.paused.subscribe(() => this.serialize()) ;

    this.loadUnits();
  }

  loadUnits(): void {
    this.unitsService.getUnits().subscribe(units => {
      this.units = units;
      this.weightUnits = this.units.filter(u => 
        u.measurement_type == MeasurementType.Weight);
      this.heightUnits = this.units.filter(u => 
        u.measurement_type == MeasurementType.Height);
      this.loadDefaultUserUnits();
      this.setDefaultUserUnits();
    });
  }

  restore(): boolean {
    const hasState = JSON.parse(localStorage.getItem('state_user_bio_data_has_state'));

    if (!hasState) {
      return false;
    }

    const stateUserBioData = localStorage.getItem('state_user_bio_data_user_bio_data');

    this.userBioData = this.service.getProperlyTypedUserBioData(JSON.parse(stateUserBioData));

    if (this.userBioData) {
      this.setDefaultUserUnits();
    }

    return true;
  }

  serialize() {
    localStorage.setItem('state_user_bio_data_has_state', JSON.stringify(true));
    localStorage.setItem('state_user_bio_data_user_bio_data', JSON.stringify(this.userBioData));
    this.serializerUtils.serializeScrollPosition();
  }

  ngOnChanges(): void {
    if (this.restore()) {
      return;
    }
  }

  setDefaultUserUnits(): void {
    if (this.defaultHeightUnit) {
      if (!this.userBioData.height_unit) {
        this.userBioData.height_unit = this.defaultHeightUnit;
      }
    }

    if (this.defaultWeightUnit) {
      if (!this.userBioData.weight_unit) {
        this.userBioData.weight_unit = this.defaultWeightUnit;
      }

      if (!this.userBioData.bone_mass_weight_unit) {
        this.userBioData.bone_mass_weight_unit = this.defaultWeightUnit;
      }
    }
  }

  loadDefaultUserUnits(): void {
    let unitSystem = this.authService.getUserUnitSystem();

    let filteredUnitsWeight = this.weightUnits.filter(u => u.system == unitSystem);
    let filteredUnitsHeight = this.heightUnits.filter(u => u.system == unitSystem);

    if (filteredUnitsWeight && filteredUnitsWeight.length > 0) {
      this.defaultWeightUnit = filteredUnitsWeight[0].id;
    }

    if (filteredUnitsHeight && filteredUnitsHeight.length > 0) {
      this.defaultHeightUnit = filteredUnitsHeight[0].id;
    }
  }

  setUserBioDataDate(event: any) {
    if (event && this.userBioData) {
      if (this.userBioData.date) {
        this.userBioData.date = new Date(event + " " + new Date(this.userBioData.date).toTimeString().substring(0, 5));
      }
      else {
        this.userBioData.date = new Date(event);
      }
    }
  }

  setUserBioDataTime(event: any) {
    if (event && this.userBioData) {
      if (this.userBioData.date) {
        this.userBioData.date = new Date(
          new Date(this.userBioData.date).toISOString().substring(0, 10) + " " + event); 
      }
      else {
        this.userBioData.date = new Date(
          (new Date()).toISOString().substring(0, 10) + " " + event); 
      }
    }
  }
}
