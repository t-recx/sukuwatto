import { AfterViewInit, Component, OnInit } from '@angular/core';
import { faSignInAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-android-download',
  templateUrl: './android-download.component.html',
  styleUrls: ['./android-download.component.css']
})
export class AndroidDownloadComponent implements OnInit, AfterViewInit {
  faSignInAlt = faSignInAlt;
  faUserPlus = faUserPlus;

  onAndroid = false;

  constructor() {
    this.onAndroid = navigator && navigator.userAgent && navigator.userAgent.toLowerCase().includes('android');
  }

  ngAfterViewInit(): void {
    if (this.onAndroid) {
      setTimeout(() => window.location.href = "../../assets/releases/sukuwatto.apk");
    }
  }

  ngOnInit(): void {
  }

}
