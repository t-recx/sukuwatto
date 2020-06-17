#!/bin/sh

ng build --configuration=android && sed  '/<body>/a <script src="assets/android/platform_www/cordova.js"></script>' dist/frontend/index.html > index.html.tmp && mv index.html.tmp dist/frontend/index.html 
