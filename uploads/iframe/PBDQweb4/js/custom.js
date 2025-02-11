// ------- PRELOADER -------//
$(window).load(function(){
  $('.preloader').fadeOut("slow"); // set duration in brackets    
});
// ----- GOOGLE MAP ----- //
var map = '';
var center;

function initialize() {
  var mapOptions = {
    zoom: 16,
    center: new google.maps.LatLng(23.5859, 58.4059), // مختصات مسقط
    scrollwheel: false
  };

  map = new google.maps.Map(document.getElementById('map-canvas'),  mapOptions);

  // اضافه کردن مارکر برای "PBDQ" (مثال: مختصات جایگزین برای PBDQ)
  var markerPosition = new google.maps.LatLng(23.5859, 58.4059); // اگر مختصات دیگری دارید، اینجا تغییر دهید
  var marker = new google.maps.Marker({
      position: markerPosition,
      map: map,
      title: 'PBDQ'
  });

  google.maps.event.addDomListener(map, 'idle', function() {
      calculateCenter();
  });

  google.maps.event.addDomListener(window, 'resize', function() {
      map.setCenter(center);
  });
}

function calculateCenter() {
center = map.getCenter();
}

function loadGoogleMap(){
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&' + 'callback=initialize';
  document.body.appendChild(script);
}

/* HTML document is loaded. DOM is ready. 
-------------------------------------------*/
$(function(){

 // --------- HIDE MOBILE MENU AFTER CLIKING ON A LINK ------- //
  $('.navbar-collapse a').click(function(){
      $(".navbar-collapse").collapse('hide');
  });

// --------- PORTFOLIO IMAGE ----- //
$('#portfolio a').nivoLightbox({
      effect: 'fadeScale',
  });

// ------- WOW ANIMATED ------ //
wow = new WOW(
{
  mobile: false
});
wow.init();

// ------- GOOGLE MAP ----- //
loadGoogleMap();

// ------- JQUERY PARALLAX ---- //
function initParallax() {
  $('#home').parallax("100%", 0.3);
  $('#team').parallax("100%", 0.3);
  $('#contact').parallax("100%", 0.1);

}
initParallax();

});
