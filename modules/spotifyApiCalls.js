const request = require('request');

function combineArrays(arrayOne, arrayTwo){
  for(let i = 0; i < arrayTwo.length; i++){
    arrayOne.push(arrayTwo[i]);
  }
  console.log(arrayOne + ' ' + arrayTwo + ' < array two')
  return arrayOne;
}

function _deletePlaylist(user_id, playlist_id, access){
  return new Promise(function(resolve, reject){
    var options = {
      url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists/' + playlist_id + '/followers',
      headers: {
        'Authorization': 'Bearer ' + access,
      },
      json: true
    };

    request.delete(options, function(error, response, body) {
      if(!error && response.statusCode === 200){
        resolve('success');
      }
      else
        reject('DeletePlaylist'  + response.statusCode);
    });
  });
}

module.exports = {

  getPlaylistTracks: function(user_id, playlist_id, query, access){
    return new Promise(function(resolve, reject){
      let offset = (query)? query : ''
      let _url = 'https://api.spotify.com/v1/users/' + user_id +'/playlists/' + playlist_id + '/tracks' + offset
      let tracks = [];

      let options = {
        url: _url,
        headers: { 'Authorization': 'Bearer ' + access },
        json: true
      };

      _url = '';

      request.get(options, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          for(let i = 0; i < body.items.length; i++){
            tracks.push(body.items[i].track.uri);
          }
          let obj = {tracks: tracks, url: body.next}
          resolve(obj);
        }
        else{
          reject('getPlaylistTracks ' + response.statusCode);
        }
      });
    });
  },

  createPlaylist: function(user_id, playlist_name, access){
    return new Promise(function(resolve, reject){
      var options = {
        url: 'https://api.spotify.com/v1/users/' + user_id +'/playlists',
        headers: {
          'Authorization': 'Bearer ' + access,
          'Content-Type': 'application/json',
        },
        body: {'name': playlist_name},
        json: true
      };

      request.post(options, function(error, response, body){
        if (!error && response.statusCode === 200 || response.statusCode === 201) {
          resolve(body)
        }
        else
          reject('CreatePlaylist'  + response.statusCode);
      });
    });
  },

  addTracksToPlaylist: function(user_id, playlist_id, shuffledTracks, access){
    return new Promise(function(resolve, reject){
      var options = {
        url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists/' + playlist_id + '/tracks',
        headers: {
          'Authorization': 'Bearer ' + access,
          'Content-Type': 'application/json',
        },
        body: {'uris': shuffledTracks},
        json: true
      };

      request.post(options, function(error, response, body) {
        if(!error && response.statusCode === 201){
          resolve('spotify:user:'+ user_id + ':playlist:' + playlist_id);
        }
        else
          reject('AddTracksToPlaylist'  + response.statusCode);
      });
    });
  },

  deletePlaylist: function(user_id , playlist_id, access){
    return(_deletePlaylist(user_id , playlist_id, access));
  },

  removeTracks: function(user_id, playlist_id, tracks, access){
    return new Promise(function(resolve, reject){
      var options = {
        url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists/' + playlist_id + '/tracks',
        headers: {
          'Authorization': 'Bearer ' + access,
          'Content-Type': 'application/json',
        },
        body: {'tracks': tracks},
        json: true
      };

      request.delete(options, function(error, response, body) {
        if(!error && response.statusCode === 200){
          resolve('success');
        }
        else
          reject('RemoveTracks'  + response.statusCode);
      });
    });
  },

  getPlaylists: function(user_id, access){
    return new Promise(function(resolve, reject){
      var options = {
        url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists',
        headers: {
          'Authorization': 'Bearer ' + access,
        },
        json: true
      };

      request.get(options, function(error, response, body) {
        if(!error && response.statusCode === 200){
          resolve(body);
        }
        else
          reject('GetPlaylists'  + response.statusCode);
      });
    });
  },

  deleteMultiplePlaylists: function(user_id, playlists, access){
    return new Promise(function(resolve, reject){
      for(let i = 0; i < playlists.length; i++){

        _deletePlaylist(user_id, playlists[i], access)
          .then(function(success){
            console.log(success)
          })
          .catch(function(error){
            console.log(error);
          });
      }
      resolve('Success');
    });
  }
}
