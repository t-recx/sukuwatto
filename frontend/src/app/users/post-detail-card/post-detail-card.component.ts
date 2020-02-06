import { Component, OnInit, Input } from '@angular/core';
import { Post } from '../post';
import { PostsService } from '../posts.service';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { ContentTypesService } from '../content-types.service';

@Component({
  selector: 'app-post-detail-card',
  templateUrl: './post-detail-card.component.html',
  styleUrls: ['./post-detail-card.component.css']
})
export class PostDetailCardComponent implements OnInit {
  @Input() id: number;
  @Input() showHeader: boolean;
  post: Post;

  faThumbsUp = faThumbsUp;

  liked: boolean;
  likes: number = 0;

  constructor(
    private contentTypeService: ContentTypesService,
    private postsService: PostsService
    ) { }

  ngOnInit() {
    this.postsService.getPost(this.id).subscribe(p => this.post = p);
  }

  getTime(post: Post): string {
    if (post.date.toLocaleDateString() != (new Date()).toLocaleDateString()) {
      return post.date.toLocaleDateString();
    }

    return post.date.toLocaleTimeString().substring(0, 5);
  }

  toggleLike(): void {
    this.liked = !this.liked;

    if (this.liked) {
      this.likes += 1;
    }
    else {
      this.likes -= 1;
    }
  }
}
