import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { ErrorService } from '../error.service';
import { AlertService } from '../alert/alert.service';
import { Observable } from 'rxjs';
import { Paginated } from './paginated';
import { catchError, tap, map } from 'rxjs/operators';
import { Post } from './post';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private postsUrl= `${environment.apiUrl}/posts/`;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService
  ) { }

  getPosts (username: string, page: number, page_size: number): Observable<Paginated<Post>> {
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

    return this.http.get<Paginated<Post>>(`${this.postsUrl}`, options)
      .pipe(
        map(response => {
          if (response.results) {
            response.results = this.getProperlyTypedPosts(response.results);
          }
          return response;
        }),
        catchError(this.errorService.handleError<Paginated<Post>>('getPosts', (e: any) => 
        { 
          this.alertService.error('Unable to fetch posts');
        }, new Paginated<Post>()))
      );
  }

  getPost (id: number | string): Observable<Post> {
    return this.http.get<Post>(`${this.postsUrl}${id}/`)
      .pipe(
        map(response => {
          return this.getProperlyTypedPost(response);
        }),
        catchError(this.errorService.handleError<Post>('getPost', (e: any) => 
        { 
          this.alertService.error('Unable to fetch post');
        }, new Post()))
      );
  }

  getProperlyTypedPosts(posts: Post[]): Post[] {
    for(let post of posts) {
      post = this.getProperlyTypedPost(post);
    }

    return posts;
  }

  getProperlyTypedPost(post: Post): Post {
    post.date = new Date(post.date);

    return post;
  }

  savePost(post: Post): Observable<Post> {
    if (post.id && post.id > 0) {
      return this.updatePost(post);
    }

    return this.createPost(post);
  }

  createPost(post: Post): Observable<Post> {
    return this.http.post<Post>(this.postsUrl, post, this.httpOptions)
    .pipe(
      tap((newPost: Post) => { }),
      catchError(this.errorService.handleError<Post>('createPost', (e: any) => 
      {
        this.alertService.error('Unable to create post, try again later');
      }, post))
    );
  }

  updatePost(post: Post): Observable<Post> {
    return this.http.put<Post>(`${this.postsUrl}${post.id}/`, post, this.httpOptions)
    .pipe(
      tap((newPost: Post) => { }),
      catchError(this.errorService.handleError<Post>('updatePost', (e: any) => 
      {
        this.alertService.error('Unable to update post, try again later');
      }, post))
    );
  }

  deletePost(post: Post): Observable<Post> {
    const id = typeof post === 'number' ? post : post.id;
    const url = `${this.postsUrl}${id}/`;

    return this.http.delete<Post>(url, this.httpOptions).pipe(
      catchError(this.errorService.handleError<Post>('deletePost', (e: any) => 
      {
        this.alertService.error('Unable to delete post, try again later');
      }, new Post()))
    );
  }
}
