const express = require('express');
const router = express.Router();
const request = require('request');
const querystring = require('querystring');
const spotify = require('spotify-web-api-node');

// Middleware
const Auth = require('../middleware/authenticated.js');
const queryCheck = require('../middleware/queryCheck.js');

// Modules
const Util = require('../modules/util.js');
const sApi = require('../modules/spotifyApiCalls.js');

let stateKey = 'spotify_auth_state'

let scopes = ['playlist-modify', 'playlist-read-private', 'playlist-modify-public', 'playlist-modify-private', 'playlist-read-collaborative'],
  redirectUri = process.env.SPOTIFY_REDIRECTURI,
  clientId = process.env.SPOTIFY_CLIENTID,
  clientSecret = process.env.SPOTIFY_SECRET,
  state = Util.generateRandomString(16);

 let spotifyApi = new spotify({
  redirectUri : redirectUri,
  clientId: clientId,
  clientSecret: clientSecret
});

let authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

router.get('/', Auth.loggedIn, function(req, res, next) {
  spotifyApi.getUserPlaylists(req.session.user_id)
    .then(function(value){
      res.render('index', {user_id:req.session.user_id, playlists: value.body.items});
    })
    .catch(function(err){
      console.log(err);
    });
});

router.get('/shuffle', Auth.loggedIn, queryCheck.checkForUri, function(req, res){
  let previousPlaylistId = (req.query.previous) ? req.query.previous : null;
  let uri = req.query.uri;

  let playlist_user_id = uri.substring(uri.indexOf('user:')+ 5, uri.indexOf(':playlist'));
  let playlist_id = uri.substring(uri.indexOf('playlist:')+ 9, uri.length);

  if(playlist_user_id.length < 1 || playlist_id.length  < 1)
  return res.send('failed');

  let Tracks = [];
  let token = req.session.user_access;
  let currentUserId = req.session.user_id;

  sApi.getPlaylistTracks(playlist_user_id, playlist_id, null, token)
  .then(function(trackObj){
    return Util.fisher_yates_shuffle(trackObj.tracks);
  })
  .then(function(shuffledTracks){
    // stores shuffledTracks then creates playlist
    Tracks = shuffledTracks;
    return sApi.createPlaylist(currentUserId, 'Shuffle:' + Util.generateRandomString(5), token);
  })
  .then(function(newPlaylist){
    //gets newly created playlist id then adds the previously shuffled tracks
    let newPlaylist_id = newPlaylist.id;
    return sApi.addTracksToPlaylist(currentUserId, newPlaylist_id, Tracks, token);
  })
  .then(function(uri){
    // successfully added tracks, returns uri of the new playlist
    res.send(uri);

    // if there was a previous shuffled playlist delete it.
    if(previousPlaylistId)
      sApi.deletePlaylist(currentUserId, previousPlaylistId, token)
        .catch(function(error){
          console.log(error);
        });
  })
  .catch(function(error){
    console.log(error);
    res.send('failed');
  });
});

router.delete('/shuffle', Auth.loggedIn, function(req, res){
  let user_id = req.session.user_id,
    token = req.session.user_access;
  sApi.getPlaylists(user_id, token)
    .then(function(playlists){
      let playlistsToRemove = [];

      for(let i = 0; i < playlists.items.length; i++){
        let playlist = playlists.items[i]
        if(playlist.name.indexOf('Shuffle:') === 0 && playlist.name.length === 13)
          playlistsToRemove.push(playlist.id);
      }

      return sApi.deleteMultiplePlaylists(user_id, playlistsToRemove, token);
    }).then(function(message){
      res.send('success')
      console.log(message);
    })
    .catch(function(error){
      res.send('failed');
      console.log(error);
    })
});

router.get('/reshuffle', Auth.loggedIn, queryCheck.checkForUri, function(req, res){
  let uri = req.query.uri;

  let playlist_user_id = uri.substring(uri.indexOf('user:')+ 5, uri.indexOf(':playlist'));
  let playlist_id = uri.substring(uri.indexOf('playlist:')+ 9, uri.length);

  if(playlist_user_id.length < 1 || playlist_id.length  < 1)
    return res.send('failed');

  let Tracks = [];
  let token = req.session.user_access;
  let currentUserId = req.session.user_id;
  // sApi calls are failing


  sApi.getPlaylistTracks(playlist_user_id, playlist_id, null, token)
    .then(function(tracks){
       return Util.fisher_yates_shuffle(tracks.tracks);
    })
    .then(function(shuffledTracks){
      // stores shuffledTracks then creates playlist
      Tracks = shuffledTracks;
      return sApi.createPlaylist(currentUserId, 'Shuffle:' + Util.generateRandomString(5), token);
    })
    .then(function(newPlaylist){
      //gets newly created playlist id then adds the previously shuffled tracks
      let newPlaylist_id = newPlaylist.id;
      return sApi.addTracksToPlaylist(currentUserId, newPlaylist_id, Tracks, token);
    })
    .then(function(uri){
      res.send(uri);
      return sApi.deletePlaylist(currentUserId, playlist_id, token);
    })
    .catch(function(error){
      console.log(error);
      res.send('failed');
    })
});

router.get('/login', function(req, res){
  res.render('login');
});

router.get('/authorize', function(req, res){
  res.cookie(stateKey, state);

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: clientId,
      scope: scopes,
      redirect_uri : redirectUri,
      state: state
    }));
});

router.get('/callback', function(req, res){

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(clientId + ':' + clientSecret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        req.session.user_access = access_token;

          spotifyApi.setAccessToken(access_token);
          spotifyApi.setRefreshToken(refresh_token);



        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          req.session.user_id = body.id;
          res.redirect('/');
        });
       }
    });
   }
});

module.exports = router;
