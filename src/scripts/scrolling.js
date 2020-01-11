export default function scrolling() {
  const location = window.location;

  $('a.landing-scroll[href*="#"]:not([href="#"])').click(function () {
    if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
      let target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top - 54)
        }, 1000, 'easeInOutExpo');

        return false;
      }
    }
  });

  $('.landing-scroll').click(function () {
    $('.navbar-collapse').collapse('hide');
  });

  $('body').scrollspy({
    target: '#mainLanding',
    offset: 56
  });
}
