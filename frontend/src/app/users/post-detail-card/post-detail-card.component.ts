import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Post } from '../post';
import { PostsService } from '../posts.service';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-post-detail-card',
  templateUrl: './post-detail-card.component.html',
  styleUrls: ['./post-detail-card.component.css']
})
export class PostDetailCardComponent implements OnInit {
  @Input() id: number;
  @Input() showHeader: boolean;
  @Input() commentsSectionOpen: boolean = false;
  @Output() deleted = new EventEmitter();
  post: Post = null;

  liked: boolean;
  likes: number = 0;

  authenticatedUserIsOwner: boolean = false;


  deleteModalVisible: boolean = false;

  editing: boolean = false;

  triedToSave: boolean = false;

  constructor(
    private postsService: PostsService,
    private authService: AuthService,
    ) { }

  ngOnInit() {
    this.postsService.getPost(this.id).subscribe(p => { 
      this.post = p; 
      this.checkOwner();
    });
  }

  checkOwner() {
    if (this.post) {
      this.authenticatedUserIsOwner = this.authService.isCurrentUserLoggedIn(this.post.user.username);
    }
    else {
      this.authenticatedUserIsOwner = false;
    }
  }

  getTime(date): string {
    date = new Date(date);
    if (date.toLocaleDateString() != (new Date()).toLocaleDateString()) {
      return date.toLocaleDateString();
    }

    return date.toLocaleTimeString().substring(0, 5);
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

  showDeleteModal() {
    this.deleteModalVisible = true;
  }

  hideDeleteModal() {
    this.deleteModalVisible = false;
  }

  toggleEditing() {
    this.editing = !this.editing;
  }

  delete() {
    this.postsService.deletePost(this.post).subscribe(x => 
      this.deleted.emit(this.post));
  }

  update() {
    this.triedToSave = true;

    if (this.valid()) {
      this.postsService.updatePost(this.post).subscribe(x => {
        this.post = x;

        this.toggleEditing();
        this.triedToSave = false;
      });
    }
  }

  valid(): boolean {
    if (this.post.text.trim().length == 0) {
      return false;
    }

    return true;
  }
}
