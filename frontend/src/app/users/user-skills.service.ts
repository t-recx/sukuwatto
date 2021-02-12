import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Paginated } from './paginated';
import { UserSkill } from './user-skill';

@Injectable({
  providedIn: 'root'
})
export class UserSkillsService {
  private userSkillsUrl= `${environment.apiUrl}/user-skills/`;

  constructor(
    private http: HttpClient,
  ) { }

  get(username: string, page: number = null, page_size: number = null): Observable<Paginated<UserSkill>> {
    let options = {};
    let params = new HttpParams();

    if (username) {
      params = params.set('username', username);
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

    return this.http.get<Paginated<UserSkill>>(`${this.userSkillsUrl}`, options);
  }
}
