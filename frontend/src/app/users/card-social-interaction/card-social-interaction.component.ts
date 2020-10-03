import { Component, OnInit, HostBinding, Input, OnChanges, SimpleChanges } from '@angular/core';
import { faThumbsUp, faComments, faComment, faCircleNotch, faShareAlt } from '@fortawesome/free-solid-svg-icons';
import { StreamsService } from '../streams.service';
import { Action } from '../action';
import { AuthService } from 'src/app/auth.service';
import { ContentTypesService } from '../content-types.service';
import { CommentsService } from '../comments.service';
import { Comment } from '../comment';
import { User } from 'src/app/user';
import { environment } from 'src/environments/environment';
import { LoadingService } from '../loading.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-card-social-interaction',
  templateUrl: './card-social-interaction.component.html',
  styleUrls: ['./card-social-interaction.component.css']
})
export class CardSocialInteractionComponent implements OnInit, OnChanges {
  @HostBinding('class') class = 'card-social-interaction-container';

  @Input() content_type_model: string;
  @Input() id: number;
  @Input() commentsSectionOpen: boolean = false;
  @Input() shareTitle: string;
  @Input() shareLink: string;
  @Input() likeNumber: number = 0;
  @Input() commentNumber: number = 0;
  @Input() target_plan: number;
  @Input() target_post: number;
  @Input() target_exercise: number;
  @Input() target_workout: number;
  @Input() target_user_bio_data: number;

  content_type_id: number;
  content_type_user_id: number;
  
  actions: Action[] = [];
  faThumbsUp = faThumbsUp;
  faComments = faComments;
  faComment = faComment;
  faCircleNotch = faCircleNotch;
  faShareAlt = faShareAlt;

  loading: boolean = false;

  usersThatLiked: User[];

  liked: boolean;
  liking: boolean = false;

  newCommentText: string;
  commentActions: Action[];
  commenting: boolean = false;

  createCommentSectionVisible: boolean = false;
  usersLikesModalVisible: boolean = false;

  triedToComment: boolean = false;

  canShare: boolean = false;

  socialSharing: any;

  constructor(
    private authService: AuthService,
    private contentTypesService: ContentTypesService,
    private streamsService: StreamsService,
    private commentsService: CommentsService,
    private loadingService: LoadingService,
    ) {
    const w: any = window;

    if (environment.application && w && w.plugins && w.plugins.socialsharing) {
      this.socialSharing = w.plugins.socialsharing;
    }
  }

  ngOnInit() {
    this.createCommentSectionVisible = true;
    this.triedToComment = false;

    this.loadingService.load();
    this.contentTypesService.get('customuser').subscribe(contentTypeUser => {
      this.content_type_user_id = contentTypeUser.id;

      this.contentTypesService.get(this.content_type_model).subscribe(contentType => {
        this.content_type_id = contentType.id;

        if (this.commentsSectionOpen) {
          this.loadComments();
        } 

        if (this.usersLikesModalVisible) {
          this.loadLikes();
        }

        this.checkIfUserLikedContent();
        this.loadingService.unload();
      });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const nav: any = navigator;
    
    this.canShare = (nav.canShare || this.socialSharing) && this.shareLink != null;
  }

  share() {
    const nav: any = navigator;

    if (nav.canShare) {
      nav.share({text: this.shareTitle, url: this.shareLink}).then();
    }
    else {
      this.socialSharing.shareWithOptions({message: this.shareTitle, url: this.shareLink});
    }
  }

  loadComments(cb: () => any = null) {
    this.loadingService.load();
    this.loading = true;

    this.streamsService.getTargetStream(this.content_type_id, this.id, 'commented')
    .subscribe(s => {
      this.setComments(s);
      this.loading = false;
      this.loadingService.unload();

      if (cb) {
        cb();
      }
    });
  }

  loadLikes(cb: () => any = null) {
    this.loadingService.load();
    this.loading = true;

    this.streamsService.getTargetStream(this.content_type_id, this.id, 'liked')
    .subscribe(s => {
      this.setLikes(s);
      this.loading = false;
      this.loadingService.unload();

      if (cb) {
        cb();
      }
    });
  }

  setLikes(stream: Action[]) {
    this.usersThatLiked = stream.filter(a => a.verb == 'liked').map(a => a.user);
  }

  setComments(stream: Action[]) {
    this.commentActions = stream.filter(a => a.verb == 'commented').sort((a,b) => a.timestamp.valueOf() - b.timestamp.valueOf());
  }

  checkIfUserLikedContent() {
    if (this.authService.isLoggedIn()) {
      this.streamsService.userLikedContent(this.content_type_id, this.id)
    .subscribe(x => this.liked = x);
    }
  }

  toggleLike(): void {
    this.liking = true;

    this.streamsService.toggleLike(this.content_type_id, this.id).subscribe(x => {
      this.liked = !this.liked;

      if (this.liked) {
        this.likeNumber += 1;

        let user = new User();
        user.username = this.authService.getUsername();
        this.usersThatLiked.push(user);
      }
      else {
        this.likeNumber -= 1;

        this.usersThatLiked = this.usersThatLiked.filter(x => x.username != this.authService.getUsername());
      }
      this.liking = false;
    });
  }

  toggleCommentView(): void {
    if (this.actions == null || this.actions.length == 0 && !this.commentsSectionOpen) {
      this.loadComments(() => this.commentsSectionOpen = !this.commentsSectionOpen);
    }
    else {
      this.commentsSectionOpen = !this.commentsSectionOpen;
    }
  }

  comment(): void {
    let comment = new Comment();
    this.triedToComment = false;

    comment.text = this.newCommentText;
    comment.comment_target_content_type = this.content_type_id;
    comment.comment_target_object_id = this.id.toString();
    comment.target_plan = this.target_plan;
    comment.target_post = this.target_post;
    comment.target_workout = this.target_workout;
    comment.target_exercise = this.target_exercise;
    comment.target_user_bio_data = this.target_user_bio_data;

    if (!comment.text || comment.text.trim().length == 0) {
      this.triedToComment = true;
      return;
    }

    this.commenting= true;
    this.commentsService.createComment(comment).subscribe(x => 
      {
        this.newCommentText = "";
        this.loadComments();
        this.triedToComment = false;
        this.commenting= false;
        this.commentNumber += 1;
      });
  }

  deleteComment(comment: Action): void {
    const index = this.commentActions.indexOf(comment, 0);
    if (index > -1) {
      this.commentActions.splice(index, 1);
      this.commentNumber--;

      if (this.commentNumber < 0) {
        this.commentNumber = 0;
      }
    }
  }

  toggleUserLikesModal() {
    if (this.actions == null || this.actions.length == 0 && !this.usersLikesModalVisible) {
      this.loadLikes(() => this.usersLikesModalVisible = !this.usersLikesModalVisible);
    }
    else {
      this.usersLikesModalVisible = !this.usersLikesModalVisible;
    }
  }
}
