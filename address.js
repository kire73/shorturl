/* global $ */


// add an event listener to the shorten button for when the user clicks it
$('page').on('load', function(){
  // AJAX call to /api/shorten with the URL that the user entered in the input box
  $.ajax({
    url: '/api/shorten',
    type: 'POST',
    dataType: 'JSON',
    data: {url: $('#url-field').val()},
    success: res.json(data.shortUrl)
  });

});