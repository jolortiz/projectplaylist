var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//define playlist schema
var PlaylistSchema = mongoose.Schema({
    title: {type: String, require: true},
    _id: {type: String, require: true},
    trackIDs: [String],
    tracks: [String]
  });

//virtual for playlist URL
PlaylistSchema
  .virtual('url')
  .get(function () {
      return '/playlist/' + this._id;
  });

module.exports = mongoose.model('Playlist', PlaylistSchema);