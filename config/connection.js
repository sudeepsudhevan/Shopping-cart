const mongoose = require('mongoose');
const state = {
  db: null
};

module.exports.connect = async function(done) {
  const url = 'mongodb://127.0.0.1:27017';
  const dbName = 'shopping';

  try {
    await mongoose.connect(`${url}/${dbName}`);
    state.db = mongoose.connection;
    done();
  } catch (err) {
    done(err);
  }
};

module.exports.get = function() {
  return state.db;
};
