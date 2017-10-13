var express = require('express');
var router = express.Router();
const createSpotify = require('node-spotify-api');


  //id: '842be580594b40d191b22c3d646b4dc4',
  //secret: '0cbe3e6237844584b17b58cbdb76ff2e'



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
