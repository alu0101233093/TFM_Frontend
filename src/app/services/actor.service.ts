import { Injectable } from '@angular/core';
import { Actor } from '../models/actor/actor';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BACKEND_URL } from 'src/environments/environment';
import { ActorProfile } from '../models/actor/actorProfile';
import { MoviePoster } from '../models/movie/moviePoster';

@Injectable({
  providedIn: 'root'
})
export class ActorService {

  constructor(
    private http: HttpClient
  ) { }

  public getCasting(movieId: string): Promise<Actor[]> {
    return new Promise<Actor[]>((resolve, reject) => {
      const params = new HttpParams().set('movie_id', movieId)
      return this.http.get<Actor[]>(BACKEND_URL + '/actors/casting', { params, observe: 'response' })
        .subscribe({
          next: (response) => {
            if (response.body && response.status == 200) {
              resolve(response.body)
            } else {
              reject('Unexpected error getting movie casting.')
            }
          }, error: (error) => {
            console.log(error.error || error.message)
            reject(error.message)
          }
        })
    })
  }

  public getActor(actorId: string): Promise<ActorProfile> {
    return new Promise<ActorProfile>((resolve, reject) => {
      const params = new HttpParams().set('actor_id', actorId)
      return this.http.get<ActorProfile>(BACKEND_URL + '/actors', { params, observe: 'response' }).subscribe({
        next: (response) => {
          if (response.body && response.status == 200) {
            resolve(response.body)
          } else {
            reject('Unexpected error getting actor data.')
          }
        }, error: (error) => {
          console.log(error.error || error.message)
          reject(error.message)
        }
      })
    })
  }

  public getMoviesByActor(actorId: string): Promise<MoviePoster[]> {
    return new Promise<MoviePoster[]>((resolve, reject) => {
      const params = new HttpParams().set('actor_id', actorId)
      return this.http.get<MoviePoster[]>(BACKEND_URL + '/actors/movies', { params, observe: 'response' }).subscribe({
        next: (response) => {
          if (response.body && response.status == 200) {
            resolve(response.body)
          } else {
            reject('Unexpected error getting movie casting.')
          }
        }, error: (error) => {
          console.log(error.error || error.message)
          reject(error.message)
        }
      })
    })
  }
}
