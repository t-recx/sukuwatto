import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { StreamsService } from '../streams.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Action } from '../action';
import { Paginated } from '../paginated';
import { AuthService } from 'src/app/auth.service';
import { PostsService } from '../posts.service';
import { Post } from '../post';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  actions: Action[];
  paginated: Paginated<Action>;
  paramChangedSubscription: Subscription;
  pageSize = 10;
  currentPage = 1;
  loadingOlderActions: boolean = false;
  newPostText: string;
  username: string;
  triedToPost: boolean = false;

  constructor(
    route: ActivatedRoute,
    public authService: AuthService,
    private streamsService: StreamsService,
    private postsService: PostsService,
  ) {
    this.paramChangedSubscription = route.paramMap.subscribe(val => {
      this.loadParameterDependentData(val.get('username'));
    });
  }

  ngOnInit() {
  }

  @HostListener('window:scroll', []) onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      this.loadOlderActions();
    }
  }

  ngOnDestroy(): void {
    this.paramChangedSubscription.unsubscribe();
  }

  loadParameterDependentData(username: string) {
    this.username = username;
    this.paginated = null;
    this.actions = null;
    this.newPostText = '';
    this.currentPage = 1;

    if (username && username == this.authService.getUsername()) {
      this.streamsService.getUserStream(this.currentPage, this.pageSize)
      .subscribe(paginatedActions => {
        this.paginated = paginatedActions;
        this.actions = paginatedActions.results;
      });
    }
  }

  loadOlderActions() {
    if (!this.paginated || this.loadingOlderActions || !this.paginated.next) {
      return;
    }

    this.loadingOlderActions = true;

    this.streamsService.getUserStream(this.currentPage + 1, this.pageSize)
      .subscribe(paginatedActions => {
        this.paginated = paginatedActions;
        this.actions = this.actions.concat(paginatedActions.results);
        this.currentPage += 1;
        this.loadingOlderActions = false;
      }, () => this.loadingOlderActions = false);
  }

  post(): void {
    this.triedToPost = true;

    if (this.newPostText && this.newPostText.trim().length > 0) {
      const post = new Post();

      post.text = this.newPostText;

      this.postsService.createPost(post).subscribe(() => { 
        this.newPostText = ''; 
        this.triedToPost = false; 
      });
    }
  }
}
