import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Post } from '../post';
import { PostsService } from '../posts.service';
import { AuthService } from 'src/app/auth.service';
import { faStickyNote, faCircleNotch, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

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

  faStickyNote = faStickyNote;
  faCircleNotch = faCircleNotch;
  faCheck = faCheck;
  faTimes = faTimes;

  liked: boolean;
  likes: number = 0;

  authenticatedUserIsOwner: boolean = false;

  updating: boolean = false;

  deleteModalVisible: boolean = false;

  editing: boolean = false;

  triedToSave: boolean = false;

  routerLink: any;
  shareTitle: string;
  shareLink: string;

  constructor(
    private postsService: PostsService,
    private authService: AuthService,
    private router: Router,
    ) { }

  ngOnInit() {
    this.postsService.getPost(this.id).subscribe(p => { 
      this.post = p; 
      this.checkOwner();
      this.routerLink = ['/users', this.post.user.username, 'post', this.post.id];
      this.shareTitle = 'sukuwatto: ' + this.post.user.username + '\'s post';
      this.shareLink = window.location.origin + this.router.createUrlTree(this.routerLink);
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

    let time = date.toLocaleTimeString().substring(0, 5);

    if (time[time.length - 1] == ':') {
      time = time.substring(0, 4);
    }

    return time;
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
    this.postsService.deletePost(this.post).subscribe(x => { 
      this.deleteModalVisible = false;
      this.deleted.emit(this.post);
    });
  }

  update() {
    this.triedToSave = true;

    if (this.valid()) {
      this.updating = true;
      this.postsService.updatePost(this.post).subscribe(x => {
      this.updating = false;
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
