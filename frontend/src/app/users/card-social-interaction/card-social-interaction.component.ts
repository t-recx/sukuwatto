import { Component, OnInit, HostBinding, Input } from '@angular/core';
import { faThumbsUp, faComments, faComment } from '@fortawesome/free-solid-svg-icons';
import { StreamsService } from '../streams.service';
import { Action } from '../action';
import { AuthService } from 'src/app/auth.service';
import { ContentTypesService } from '../content-types.service';
import { CommentsService } from '../comments.service';
import { Comment } from '../comment';

@Component({
  selector: 'app-card-social-interaction',
  templateUrl: './card-social-interaction.component.html',
  styleUrls: ['./card-social-interaction.component.css']
})
export class CardSocialInteractionComponent implements OnInit {
  @HostBinding('class') class = 'card-social-interaction-container';

  @Input() content_type_model: string;
  @Input() id: number;
  @Input() commentsSectionOpen: boolean = false;

  content_type_id: number;
  
  actions: Action[];
  faThumbsUp = faThumbsUp;
  faComments = faComments;
  faComment = faComment;

  liked: boolean;
  likes: number = 0;

  commentsNumber: number = 0;
  newCommentText: string;
  commentActions: Action[];

  createCommentSectionVisible: boolean = false;

  constructor(
    private authService: AuthService,
    private contentTypesService: ContentTypesService,
    private streamsService: StreamsService,
    private commentsService: CommentsService,
    ) { }

  ngOnInit() {
    this.createCommentSectionVisible = this.authService.isLoggedIn();

    this.contentTypesService.get(this.content_type_model).subscribe(contentTypes => {
      if (contentTypes.length > 0) {
        this.content_type_id = contentTypes[0].id;
        this.loadActions();
      }
    });
  }

  loadActions() {
    this.streamsService.getTargetStream(this.content_type_id, this.id)
    .subscribe(s => this.setActions(s));
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
    this.likes = this.actions.filter(a => a.verb == 'liked').length;
  }

  setCommentNumber() {
    this.commentsNumber = this.commentActions.length;
  }

  toggleLike(): void {
    this.streamsService.toggleLike(this.content_type_id, this.id).subscribe(x => {
      this.liked = !this.liked;

      if (this.liked) {
        this.likes += 1;
      }
      else {
        this.likes -= 1;
      }
    });
  }

  toggleCommentView(): void {
    this.commentsSectionOpen = !this.commentsSectionOpen;
  }

  comment(): void {
    let comment = new Comment();

    comment.text = this.newCommentText;
    comment.comment_target_content_type = this.content_type_id;
    comment.comment_target_object_id = this.id.toString();

    this.commentsService.createComment(comment).subscribe(x => 
      {
        this.newCommentText = "";
        this.loadActions();
      });
  }
}
