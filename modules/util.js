
module.exports = {

  generateRandomString : function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  },

  fisher_yates_shuffle : function(array){
    let m = array.length, t, i;

    while(m){
      //Generation random element
      i = Math.floor(Math.random() * m--);

      // Swap with current
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }

    return array;
  }

}
