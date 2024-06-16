import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Review } from 'src/app/models/review/review';
import { userProfile } from 'src/app/models/user/userProfile';
import { ReviewsService } from 'src/app/services/reviews.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-movie-reviews',
  templateUrl: './movie-reviews.component.html',
  styleUrls: ['./movie-reviews.component.css']
})
export class MovieReviewsComponent {
  @Input() movieId: string = '';
  public criticsReviews: Record<string, Review> = {} as Record<string, Review>;
  public spectatorReviews: Record<string, Review> = {} as Record<string, Review>;
  public user: userProfile = {} as userProfile;

  constructor(
    private reviewsService: ReviewsService,
    private userService: UserService,
    private http: HttpClient,
    private router: Router
  ){}

  ngOnInit(){
    this.reviewsService.getReviews(this.movieId).then((reviews) => {
      this.userService.getBasicUserData().then((user) => {
        if (user) {
          this.user = user;
          this.criticsReviews = this.sortReviews(
            reviews.critics,
            user.uid
          );
          this.spectatorReviews = this.sortReviews(
            reviews.spectators,
            user.uid
          );
        } else {
          this.criticsReviews = reviews.critics;
          this.spectatorReviews = reviews.spectators;
        }
      });
    })
  }

  private sortReviews(
    reviews: Record<string, Review>,
    targetUid: string
  ): Record<string, Review> {
    const sortedReviews = Object.entries(reviews).sort(
      ([_keyA, reviewA], [_keyB, reviewB]) => {
        if (reviewA.uid === targetUid && reviewB.uid !== targetUid) {
          return -1;
        }
        if (reviewA.uid !== targetUid && reviewB.uid === targetUid) {
          return 1;
        }
        return 0;
      }
    );

    return Object.fromEntries(sortedReviews);
  }

  getSpectatorReviewIds(): string[] {
    return Object.keys(this.spectatorReviews);
  }

  getCriticReviewIds(): string[] {
    return Object.keys(this.criticsReviews);
  }

  calculateAverageRating(reviews: Record<string, Review>): number {
    const reviewIds = Object.keys(reviews);
    if (reviewIds.length === 0) {
      return 0;
    }

    const totalScore = reviewIds.reduce((acc, curr) => acc + reviews[curr].score, 0);
    const averageRating = totalScore / reviewIds.length;

    return Math.round(averageRating * 10) / 10;
  }

  openReviewEditor() {
    if (!this.user.uid) {
      Swal.fire({
        title: '¿Quién eres?',
        text: 'Para publicar una reseña debes iniciar sesión primero.',
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: 'Iniciar sesión',
        cancelButtonText: 'Cancelar',
        footer:
          '¿No tienes una cuenta? Prueba a <a href="/register">Registrarse</a>',
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.http.get('assets/reviewEditor.html', { responseType: 'text' })
      .subscribe((html) => {
        Swal.fire({
          title: 'Por favor, introduce tu puntuación y reseña:',
          html,
          showCancelButton: true,
          preConfirm: this.preConfirmPostReview,
        }).then((reviewResult) => {
          if (reviewResult.isConfirmed) {
            const { score, text } = reviewResult.value;
            Swal.fire({
              title: 'Publicando reseña...',
              text: 'Por favor espere.',
              allowOutsideClick: false,
              didOpen: () => {
                Swal.showLoading();
              },
            });
            this.postReview(score, text);
          }
        });
      });
    }
  }

  preConfirmPostReview(){
    const scoreElement = document.querySelector('input[name="score"]:checked') as HTMLInputElement;
    const reviewElement = document.getElementById('reviewTextArea') as HTMLTextAreaElement;
    const score = scoreElement ? parseInt(scoreElement.value) : null;
    const text = reviewElement ? reviewElement.value : null;
    if (!score) {
      Swal.showValidationMessage('La puntuación debe estar entre 1 y 5.');
      return false;
    }
    if (!text) {
      Swal.showValidationMessage('La reseña no puede estar vacía.');
      return false;
    }
    return { score, text };
  }

  postReview(score: number, reviewText: string) {
    const newReview: Review = {
      movieId: parseInt(this.movieId),
      uid: this.user.uid,
      username: this.user.displayName || '',
      photoURL: this.user.photoURL || '',
      score,
      text: reviewText,
    };
    this.reviewsService.postReview(newReview).then((response) => {
      Swal.fire({
        title: 'Reseña publicada',
        text: response.message,
        icon: 'success',
        showCloseButton: true,
      }).then(() => {
        if (this.user.emailVerified) {
          this.criticsReviews = {
            [response.reviewId]: newReview as Review,
            ...this.criticsReviews,
          };
        } else {
          this.spectatorReviews = {
            [response.reviewId]: newReview as Review,
            ...this.spectatorReviews,
          };
        }
      });
    }).catch((error) => {
      Swal.fire({
        title: 'Error',
        text: error,
        icon: 'error',
        showCloseButton: true,
      });
    })
  }

  deleteReview(reviewId: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.reviewsService.deleteReview(reviewId, parseInt(this.movieId))
        .then((response) => {
          Swal.fire({
            title: 'Reseña eliminada',
            text: response,
            icon: 'success',
            showCloseButton: true
          }).then(() => {
            if (this.user.emailVerified) {
              delete this.criticsReviews[reviewId];
            } else {
              delete this.spectatorReviews[reviewId];
            }
          });
        })
      }
    });
  }
}