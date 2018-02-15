var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//define playlist schema
var PlaylistSchema = mongoose.Schema({
    title: {type: String, require: true},
    connectCode: {type: String, require: true},
    numberOfTracks: Number,
    tracks: [String]
  });

//virtual for playlist URL
PlaylistSchema
  .virtual('url')
  .get(function () {
      return '/playlist/' + this.connectCode;
  });

module.exports = mongoose.model('Playlist', PlaylistSchema);