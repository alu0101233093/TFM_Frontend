import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Actor } from 'src/app/models/actor';
import { MoviePoster } from 'src/app/models/moviePoster';
import { MovieService } from 'src/app/services/movie.service';

@Component({
  selector: 'app-actor',
  templateUrl: './actor.component.html',
  styleUrls: ['./actor.component.css']
})
export class ActorComponent {

  actorData: Actor = {} as Actor
  movies: MoviePoster[] = []

  constructor(
    private router: Router, 
    private movieService: MovieService
  ) {}

  ngOnInit() {
    const currentUrl = this.router.url;
    const urlParams = new URLSearchParams(currentUrl.split('?')[1]);
    const actorId = urlParams.get('id');

    if(actorId){
      this.movieService.getActor(actorId).subscribe({
        next: (response) => {
          this.actorData = response
        }, error: (error) => {
          console.log(error)
        }
      })

      this.movieService.getMoviesByActor(actorId).subscribe({
        next: (response) => {
          this.movies = response
        }, error: (error) => {
          console.log(error)
        }
      })
    } else {
      this.router.navigate(['/home'])
    }
  }
}