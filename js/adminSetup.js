const admin = require('firebase-admin');

const serviceAccount = require('../DonotOpen.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://society-57457-default-rtdb.firebaseio.com/' 
});

module.exports = admin;