const request = require('request');


module.exports = {

  getPlaylistTracks: function(user_id, playlist_id, access){
    return new Promise(function(resolve, reject){
      var options = {
        url: 'https://api.spotify.com/v1/users/' + user_id +'/playlists/' + playlist_id + '/tracks',
        headers: { 'Authorization': 'Bearer ' + access },
        json: true
      };

      // use the access token to access the Spotify Web API
      request.get(options, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          let trackUris = [];

          for(let i = 0; i < body.items.length; i++){
            trackUris.push(body.items[i].track.uri)
          }

          resolve(trackUris);
        }

        reject(response.error, response.statusCode);
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
        reject(response.error, response.statusCode);
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
        reject(response.error, response.statusCode);
      });
    });
  },

  deletePlaylist: function(user_id , playlist_id, access){
    return new Promise(function(resolve, reject){
      var options = {
        url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists/' + playlist_id + '/followers',
        headers: {
          'Authorization': 'Bearer ' + access,
          'Content-Type': 'application/json',
        },
        json: true
      };

      request.delete(options, function(error, response, body) {
        if(!error && response.statusCode === 200){
          resolve('success');
        }
        reject(response.error, response.statusCode);
      });
    });
  },

  reshufflePlaylist: function(){

  }
}
