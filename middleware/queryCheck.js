module.exports.checkForUri = function(req, res, next){
  if(!req.query.uri)
    return res.send('failed');

  let uri = req.query.uri;

  if(uri.indexOf('user:') < 0 || uri.indexOf('playlist:'))
    return res.send('failed');

  next();
}
