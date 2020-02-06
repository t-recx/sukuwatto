import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { ErrorService } from '../error.service';
import { AlertService } from '../alert/alert.service';
import { Observable } from 'rxjs';
import { Paginated } from './paginated';
import { catchError, tap, map } from 'rxjs/operators';
import { Comment } from './comment';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private commentsUrl= `${environment.apiUrl}/comments/`;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService
  ) { }

  getComments (username: string, page: number, page_size: number): Observable<Paginated<Comment>> {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params = params.set('user__username', username);
    }

    if (page) {
      params = params.set('page', page.toString());
    }

    if (page_size) {
      params = params.set('page_size', page_size.toString());
    }

    if (username || page || page_size) {
      options = {params: params};
    }

    return this.http.get<Paginated<Comment>>(`${this.commentsUrl}`, options)
      .pipe(
        map(response => {
          if (response.results) {
            response.results = this.getProperlyTypedComments(response.results);
          }
          return response;
        }),
        catchError(this.errorService.handleError<Paginated<Comment>>('getComments', (e: any) => 
        { 
          this.alertService.error('Unable to fetch comments');
        }, new Paginated<Comment>()))
      );
  }

  getComment (id: number | string): Observable<Comment> {
    return this.http.get<Comment>(`${this.commentsUrl}${id}/`)
      .pipe(
        map(response => {
          return this.getProperlyTypedComment(response);
        }),
        catchError(this.errorService.handleError<Comment>('getComment', (e: any) => 
        { 
          this.alertService.error('Unable to fetch comment');
        }, new Comment()))
      );
  }

  getProperlyTypedComments(comments: Comment[]): Comment[] {
    for(let comment of comments) {
      comment = this.getProperlyTypedComment(comment);
    }

    return comments;
  }

  getProperlyTypedComment(comment: Comment): Comment {
    comment.date = new Date(comment.date);

    return comment;
  }

  saveComment(comment: Comment): Observable<Comment> {
    if (comment.id && comment.id > 0) {
      return this.updateComment(comment);
    }

    return this.createComment(comment);
  }

  createComment(comment: Comment): Observable<Comment> {
    return this.http.post<Comment>(this.commentsUrl, comment, this.httpOptions)
    .pipe(
      tap((newComment: Comment) => { }),
      catchError(this.errorService.handleError<Comment>('createComment', (e: any) => 
      {
        this.alertService.error('Unable to create comment, try again later');
      }, comment))
    );
  }

  updateComment(comment: Comment): Observable<Comment> {
    return this.http.put<Comment>(`${this.commentsUrl}${comment.id}/`, comment, this.httpOptions)
    .pipe(
      tap((newComment: Comment) => { }),
      catchError(this.errorService.handleError<Comment>('updateComment', (e: any) => 
      {
        this.alertService.error('Unable to update comment, try again later');
      }, comment))
    );
  }

  deleteComment(comment: Comment): Observable<Comment> {
    const id = typeof comment === 'number' ? comment : comment.id;
    const url = `${this.commentsUrl}${id}/`;

    return this.http.delete<Comment>(url, this.httpOptions).pipe(
      catchError(this.errorService.handleError<Comment>('deleteComment', (e: any) => 
      {
        this.alertService.error('Unable to delete comment, try again later');
      }, new Comment()))
    );
  }
}
