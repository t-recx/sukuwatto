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

  content_type_id: number;
  
  actions: Action[];
  faThumbsUp = faThumbsUp;
  faComments = faComments;
  faComment = faComment;
  faCircleNotch = faCircleNotch;
  faShareAlt = faShareAlt;

  loading: boolean = false;

  usersThatLiked: User[];

  liked: boolean;
  likes: number = 0;
  liking: boolean = false;

  commentsNumber: number = 0;
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
    ) {
    const w: any = window;

    if (environment.application && w && w.plugins && w.plugins.socialsharing) {
      this.socialSharing = w.plugins.socialsharing;
    }
  }

  ngOnInit() {
    this.createCommentSectionVisible = true;
    this.triedToComment = false;


    this.contentTypesService.get(this.content_type_model).subscribe(contentType => {
        this.content_type_id = contentType.id;
        this.loadActions();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.canShare = this.socialSharing && this.shareLink != null;
  }

  share() {
    this.socialSharing.shareWithOptions({message: this.shareTitle, url: this.shareLink});
  }

  loadActions() {
    this.loading = true;
    this.streamsService.getTargetStream(this.content_type_id, this.id)
    .subscribe(s => {
      this.setActions(s);
      this.loading = false;
    });
  }

  setActions(stream: Action[]) {
    this.actions = stream;

    if (this.loggedUserLikedObject()) {
      this.liked = true;
    }

    this.setLikeNumber();

    this.commentActions = stream.filter(a => a.verb=='commented');

    this.setCommentNumber();
  }

  loggedUserLikedObject() {
    return this.actions && this.actions.filter(a => 
        a.verb == 'liked' &&
        a.actor.object_type == 'user' &&
        a.actor.display_name == this.authService.getUsername()).length > 0;
  }

  setLikeNumber() {
    this.usersThatLiked = [];

    let likeActions = this.actions.filter(a => a.verb == 'liked');

    this.likes = likeActions.length;
    likeActions.forEach(action => 
      {
        let user = new User();

        user.username = action.actor.display_name;

        this.usersThatLiked.push(user);
      });

  }

  setCommentNumber() {
    this.commentsNumber = this.commentActions.length;
  }

  toggleLike(): void {
    this.liking = true;

    this.streamsService.toggleLike(this.content_type_id, this.id).subscribe(x => {
      this.liked = !this.liked;

      if (this.liked) {
        this.likes += 1;

        let user = new User();
        user.username = this.authService.getUsername();
        this.usersThatLiked.push(user);
      }
      else {
        this.likes -= 1;

        this.usersThatLiked = this.usersThatLiked.filter(x => x.username != this.authService.getUsername());
      }
      this.liking = false;
    });
  }

  toggleCommentView(): void {
    this.commentsSectionOpen = !this.commentsSectionOpen;
  }

  comment(): void {
    let comment = new Comment();
    this.triedToComment = false;

    comment.text = this.newCommentText;
    comment.comment_target_content_type = this.content_type_id;
    comment.comment_target_object_id = this.id.toString();

    if (!comment.text || comment.text.trim().length == 0) {
      this.triedToComment = true;
      return;
    }

    this.commenting= true;
    this.commentsService.createComment(comment).subscribe(x => 
      {
        this.newCommentText = "";
        this.loadActions();
        this.triedToComment = false;
        this.commenting= false;
      });
  }

  deleteComment(comment: Action): void {
    const index = this.commentActions.indexOf(comment, 0);
    if (index > -1) {
      this.commentActions.splice(index, 1);
      this.commentsNumber--;
    }
  }

  toggleUserLikesModal() {
    this.usersLikesModalVisible = !this.usersLikesModalVisible;
  }
}
