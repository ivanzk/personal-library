/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
const MONGODB_URI = process.env.MONGODB_URI;
const mongoose = require('mongoose');


module.exports = function (app) {
  mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
    
  const bookSchema = new mongoose.Schema({
    title: {
      type: String,
      match: /\w+/,
      required: true
    },
    comments: {
      type: [String],
      match: /\w+/
    },
    comments_count: Number,
    year: Number
  });

  bookSchema.virtual('bookAndYear').get(function() {
    return `${this.title} (${this.year})`;
  });

  const Book = mongoose.model('Book', bookSchema);


  app.route('/api/books')
    .get(function (req, res){
      Book.find((err, books) => {
        if (err) {
          if (err.title) res.send('missing title');
          return console.error(err);
        }
        res.json(books.map(book => ({_id: book._id, title: book.title, commentcount: book.comments.length})));
      });
    })
    
    .post(function (req, res){
      const book = new Book({title: req.body.title});
      book.save((err, book) => {
        if (err) {
          if (err.title) res.send('missing title');
          return console.error(err);
        }
        res.json({_id: book._id, title: book.title});
      });
    })
    
    .delete(function(req, res){
      Book.deleteMany({}, (err) => {
        if (err) return console.error(err);
        res.send('complete delete successful');
      });
    });

  
  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      Book.findOne({_id: bookid}, (err, book) => {
        if (err) {
          res.send('no book exists');
          return console.error(err); 
        }
        res.json({_id: book._id, title: book.title, comments: book.comments || []});
      });
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
      Book.findOneAndUpdate({_id: bookid}, {$push: {comments: comment}}, {new: true}, (err, book) => {
        if (err) return console.error(err);
        res.json({_id: book._id, title: book.title, comments: book.comments || []});
      });
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      Book.deleteOne({_id: bookid}, (err) => {
        if (err) return console.error(err);
        res.send('delete successful');
      });
    });
  
};
