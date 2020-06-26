/*
    Needed for the back button to work correctly
    More info:
        * https://archive.thinktecture.com/thomas/2017/02/cordova-vs-zonejs-or-why-is-angulars-document-event-listener-not-in-a-zone.html
        * https://github.com/angular/angular/issues/22509
*/
window.addEventListener = function () {
    EventTarget.prototype.addEventListener.apply(this, arguments);
};
window.removeEventListener = function () {
    EventTarget.prototype.removeEventListener.apply(this, arguments);
};
document.addEventListener = function () {
    EventTarget.prototype.addEventListener.apply(this, arguments);
};
document.removeEventListener = function () {
    EventTarget.prototype.removeEventListener.apply(this, arguments);
};