modeule.exports.checkCookie = function(req, res, next){
  if(!res.session.user_id)
    res.session.user_id = '';

  next();
}
