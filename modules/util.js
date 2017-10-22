
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
    return new Promise(function(resolve, reject){
      if(!array.length || array.length < 1)
        return reject('Nothing in array');

      let m = array.length, t, i;

      while(m){
        //Generation random element
        i = Math.floor(Math.random() * m--);

        // Swap with current
        t = array[m];
        array[m] = array[i];
        array[i] = t;
      }

      resolve(array);
    });
  }
}
