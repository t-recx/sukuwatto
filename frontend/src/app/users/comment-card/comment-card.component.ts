import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Comment } from '../comment';
import { CommentsService } from '../comments.service';
import { AuthService } from 'src/app/auth.service';
import { Action } from '../action';
import { faCircleNotch, faComment, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { catchError } from 'rxjs/operators';
import { ErrorService } from 'src/app/error.service';
import { AlertService } from 'src/app/alert/alert.service';

@Component({
  selector: 'app-comment-card',
  templateUrl: './comment-card.component.html',
  styleUrls: ['./comment-card.component.css']
})
export class CommentCardComponent implements OnInit {
  @Input() comment: Action;
  @Output() deleted = new EventEmitter<Action>();

  faCircleNotch = faCircleNotch;
  faComment = faComment;
  faCheck = faCheck;
  faTimes = faTimes;

  newComment: string;
  authenticatedUserIsOwner: boolean = false;

  deleteModalVisible: boolean = false;
  editing: boolean = false;
  updating: boolean = false;

  triedToSave: boolean = false;
  modalSupportVisible: boolean = false;

  constructor(
    private commentsService: CommentsService,
    private authService: AuthService,
    private errorService: ErrorService,
    private alertService: AlertService,
    ) { }

  ngOnInit() {
    this.checkOwner();
  }

  checkOwner() {
    if (this.comment) {
      this.authenticatedUserIsOwner = this.authService.isCurrentUserLoggedIn(this.comment.user.username);
    }
    else {
      this.authenticatedUserIsOwner = false;
    }
  }

  showDeleteModal() {
    this.deleteModalVisible = true;
  }

  hideDeleteModal() {
    this.deleteModalVisible = false;
  }

  update() {
    this.triedToSave = true;

    if (this.valid()) {
      this.updating = true;

      delete this.comment.action_object_comment.date;

      this.commentsService.saveComment(this.comment.action_object_comment)
      .pipe(
        catchError(this.errorService.handleError<Comment>('updateComment', (e: any) => 
        {
          if (e && e.status && e.status == 403) {
            this.modalSupportVisible = true;
          }
          else {
            this.alertService.error('Unable to save comment, try again later');
          }
        }, null))
      )
      .subscribe(y => {
        this.updating = false;
        if (y != null) {
          this.editing = false;
          this.triedToSave = false;
        }
      });
    }
  }

  valid(): boolean {
    if (this.comment.action_object_comment.text.trim().length == 0) {
      return false;
    }

    return true;
  }

  delete() {
    this.commentsService
      .deleteComment(+this.comment.action_object_comment.id)
      .pipe(
        catchError(this.errorService.handleError<any>('updateComment', (e: any) => {
          if (e && e.status && e.status == 403) {
            this.modalSupportVisible = true;
          }
          else {
            this.alertService.error('Unable to save comment, try again later');
          }
        }, 'error'))
      )
      .subscribe(x => {
        this.hideDeleteModal();
        if (x != 'error') {
          this.deleted.emit(this.comment);
        }
      });
  }

  toggleEditing() {
    this.editing = !this.editing;
  }
}
