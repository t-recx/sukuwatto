import { Component, OnInit, HostBinding } from '@angular/core';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-card-social-interaction',
  templateUrl: './card-social-interaction.component.html',
  styleUrls: ['./card-social-interaction.component.css']
})
export class CardSocialInteractionComponent implements OnInit {
  @HostBinding('class') class = 'card-social-interaction-container';

  faThumbsUp = faThumbsUp;

  liked: boolean;
  likes: number = 0;

  constructor(

    ) { }

  ngOnInit() {
  }

  toggleLike(): void {
    this.liked = !this.liked;

    if (this.liked) {
      this.likes += 1;
    }
    else {
      this.likes -= 1;
    }
  }
}
