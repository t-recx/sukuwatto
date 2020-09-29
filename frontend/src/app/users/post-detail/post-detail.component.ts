import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '../post';
import {Location} from '@angular/common';
import { PostsService } from '../posts.service';
import { LoadingService } from '../loading.service';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent implements OnInit,OnDestroy {
  id: number;

  notFound = false;
  post: Post = null;
  paramChangedSubscription: Subscription;

  constructor(
    private router: Router,
    route: ActivatedRoute,
    private location: Location,
    private postsService: PostsService,
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

    this.postsService.getPost(this.id).subscribe(post => {
      this.post = post;

      if (!this.post) {
        this.notFound = true;
      }
      this.loadingService.unload();
    });
  }

  postDeleted(post: Post) {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}
