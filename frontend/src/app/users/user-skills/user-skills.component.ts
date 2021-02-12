import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faArrowCircleLeft, faArrowLeft, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { catchError } from 'rxjs/operators';
import { AlertService } from 'src/app/alert/alert.service';
import { ErrorService } from 'src/app/error.service';
import { User } from 'src/app/user';
import { UserService } from 'src/app/user.service';
import { environment } from 'src/environments/environment';
import { LevelService } from '../level.service';
import { LoadingService } from '../loading.service';
import { PageSizeService } from '../page-size.service';
import { Paginated } from '../paginated';
import { UserSkill } from '../user-skill';
import { UserSkillsService } from '../user-skills.service';

@Component({
  selector: 'app-user-skills',
  templateUrl: './user-skills.component.html',
  styleUrls: ['./user-skills.component.css']
})
export class UserSkillsComponent implements OnInit {
  pageSize = 10;
  skills: UserSkill[] = [];
  loadingSkills: boolean;
  paginatedSkills: Paginated<UserSkill>;
  pageSkills: number = 1;
  initSkills = false;
  username: string;
  notFound: boolean = false;
  forbidden: boolean = false;
  arrowLeft = faArrowCircleLeft;
  experienceBarWidth = {};
  userSkillExperienceNextLevel = {};

  constructor(
    private loadingService: LoadingService,
    private userSkillsService: UserSkillsService,
    private route: ActivatedRoute,
    private errorService: ErrorService,
    private alertService: AlertService,
    private pageSizeService: PageSizeService,
    private levelService: LevelService,
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params =>
      this.load(params.get('username')));
  }

  setPageSize() {
    this.pageSize = this.pageSizeService.getPageSize(32);
  }

  private load(username: string) {
    this.username = username;
    this.setPageSize();
    this.forbidden = false;
    this.notFound = false;
    this.initSkills = false;
    this.paginatedSkills = null;
    this.skills = [];
    this.pageSkills = 1;
    this.loadUserData(username);
  }

  private loadUserData(username: string) {
    this.notFound = false;
    this.username = username;

    if (this.username) {
      this.userService
      .userExists(this.username)
      .subscribe(exists => {
        if (exists) {
          this.loadSkills();
        }
        else {
          this.notFound = true;
        }
      });
    }
  }

  loadSkills(increment: number = 0): void {
    if (increment > 0 && this.paginatedSkills && !this.paginatedSkills.next) {
      return;
    }

    this.loadingService.load();
    this.loadingSkills = true;
    this.userSkillsService.get(this.username, this.pageSkills + increment, this.pageSize)
    .pipe(
        catchError(this.errorService.handleError<Paginated<UserSkill>>('following', (e: any) => 
        { 
          if (e && e.status) {
            if (e.status == 403) {
              this.forbidden = true;
            }
            else if (e.status == 404) {
              this.notFound = true;
            }
            else {
              this.alertService.error('Unable to fetch skills');
            }
          }
          else {
            this.alertService.error('Unable to fetch skills');
          }
        }, new Paginated<UserSkill>()))
    )
    .subscribe(paginated => 
      {
        const skills = paginated.results;
        this.paginatedSkills = paginated;
        this.pageSkills += increment;

        skills.forEach(s => {
          this.experienceBarWidth[s.id] = this.levelService.getExperienceBarWidth(s);
          this.userSkillExperienceNextLevel[s.id] = this.levelService.getLevelExperience(s.level + 1);
        });

        this.skills.push(...skills.filter(f => this.skills.filter(ff => ff.id == f.id).length == 0));
        this.loadingSkills = false;

        this.initSkills = true;

        this.loadingService.unload();
      });
  }

  @HostListener('window:scroll', []) onScroll(): void {
    if (this.pageSizeService.canScroll()) {
      if (this.paginatedSkills.next) {
        this.loadSkills(1);
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.loadMoreIfNoScroll();
  }

  loadMoreIfNoScroll() {
    const w : any = window;

    if (w.scrollMaxY == 0) {
      this.loadSkills(1);
    }
  }
}
