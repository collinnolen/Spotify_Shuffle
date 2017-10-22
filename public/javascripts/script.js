let previousPlaylistId =''

$(document).ready(function() {

  $( window ).resize(function() {
    $('.now-playing iframe').attr('width', $('.now-playing').width() - 50);
  });

  $('.clicker').click(function(event){
    let optional = (previousPlaylistId === '') ? '' : '&previous='+ previousPlaylistId;

    $.ajax({
    type: "GET",
    url: "/shuffle" + '?uri=' + $(event.target).attr('data-uri') + optional,
      success: function(data){
        if(data != 'failed'){
          swapIframe(data);
          swapVisable('#user-playlists', '.now-playing');
        }
        else console.log(data);
      },
      error: function(error){
        console.log(error)
      },
    });
  });

  $('#switch').click(function(event){
    let uri = $('iframe').attr('src');
    previousPlaylistId = uri.substring(uri.indexOf('playlist:')+ 9, uri.length);
    swapVisable('.now-playing','#user-playlists');
  });

  $('#deleteShuffles').click(function(event){
    $.ajax({
      type: "DELETE",
      url: "/shuffle",
        success: function(data){
          console.log(data);
        },
        error: function(data){
          console.log(data);
        }
    })
  });

  $('#reshuffle').click(function(event){
    let url = $('iframe').attr('src');
    let uri = url.substring(url.indexOf('spotify:'), url.length);

    $.ajax({
      type: "GET",
      url: "/reshuffle" + '?uri=' +  uri,
        success: function(data){
          if(data != 'failed'){
            $('iframe').attr('src', 'https://open.spotify.com/embed?uri=' + data);
          }
          else{
            console.log('failed')
          }
        },
        error: function(error){
          console.log(error);
        }
    })
  });

  function swapIframe(uri){
    $('.now-playing iframe').attr(
      'src',
      'https://open.spotify.com/embed?uri=' + uri
    );
    $('.now-playing iframe').attr('width', $('.now-playing').width() - 50);
    $('.now-playing iframe').attr('height', 500);
  }

  function swapVisable(toHide, toShow){
    $(toHide).fadeOut('medium', function(){
        $(toHide).addClass('hidden');
        $(toShow).fadeIn('medium', function(){
          $(toShow).removeClass('hidden');
        })
    })
  }

});
