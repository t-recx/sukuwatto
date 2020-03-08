import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { UserBioData } from '../user-bio-data';
import { UserBioDataService } from '../user-bio-data.service';
import { Unit, MeasurementType } from '../unit';
import { AuthService } from 'src/app/auth.service';
import { UnitsService } from '../units.service';

@Component({
  selector: 'app-user-bio-data-detail',
  templateUrl: './user-bio-data-detail.component.html',
  styleUrls: ['./user-bio-data-detail.component.css']
})
export class UserBioDataDetailComponent implements OnInit, OnChanges {
  @Input() username: string;
  @Input() start: Date;
  @Input() visible: boolean;
  @Output() closed = new EventEmitter();
  @Output() okayed = new EventEmitter<UserBioData>();

  units: Unit[];
  weightUnits: Unit[];
  heightUnits: Unit[];

  triedToHide: boolean;
  userBioData: UserBioData;
  defaultWeightUnit: number = null;
  defaultHeightUnit: number = null;

  weight_unit_invalid: boolean;
  height_unit_invalid: boolean;
  bone_mass_weight_unit_invalid: boolean;

  constructor(
    private service: UserBioDataService,
    private authService: AuthService,
    private unitsService: UnitsService,
    ) { }

  ngOnInit() {
    this.userBioData = new UserBioData();
    this.userBioData.date = this.start;
    this.triedToHide = false;

    this.weight_unit_invalid = false;
    this.height_unit_invalid = false;
    this.bone_mass_weight_unit_invalid = false;

    this.loadUnits();
    this.loadUserBioData();
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

  ngOnChanges(changes: SimpleChanges): void {
    let startChanged: boolean = false;

    startChanged = "start" in changes;

    if (startChanged && this.userBioData) {
      this.userBioData.date = this.start;

      this.loadUserBioData();
    }
  }

  loadUserBioData(): void {
    if (!this.start) {
      return;
    }

    this.service.getLastUserBioData(this.username, new Date(this.start))
      .subscribe(data => {
        if (data) {
          this.userBioData = data;

          delete this.userBioData.id;

          this.userBioData.date = this.start;

          this.setDefaultUserUnits();
        }
      });
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

  hide(): boolean {
    this.triedToHide = true;

    if (!this.valid()) {
      return false;
    }

    this.visible = false;
    this.triedToHide = false;
    this.closed.emit();

    return true;
  }

  okay(): void {
    if (this.hide()) {
      this.okayed.emit(this.userBioData);
    }
  }

  valid(): boolean {
    if (!this.userBioData.date) {
      return false;
    }

    if (this.userBioData.weight && !this.userBioData.weight_unit) {
      this.weight_unit_invalid = true;
      return false;
    }
    else {
      this.weight_unit_invalid = false;
    }

    if (this.userBioData.bone_mass_weight && !this.userBioData.bone_mass_weight_unit) {
      this.bone_mass_weight_unit_invalid = true;
      return false;
    }
    else {
      this.bone_mass_weight_unit_invalid = false;
    }

    if (this.userBioData.height && !this.userBioData.height_unit) {
      this.height_unit_invalid = true;
      return false;
    }
    else {
      this.height_unit_invalid = false;
    }

    return true;
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
