/* global $ */


// add an event listener to the shorten button for when the user clicks it
$('page').on('load', function(req, res, longUrl){
  // AJAX call to /api/shorten with the URL that the user entered in the input box
  $('#url-field').html(longUrl);
  $('btn-shorten').trigger('click');
  $.ajax({
    url: '/new/:url*',
    type: 'POST',
    dataType: 'JSON',
    data: {url: $('#url-field').val()},
    success: function(data){
      res.send(data.shortUrl);
    }
  });

});