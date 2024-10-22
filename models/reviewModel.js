import mongoose from 'mongoose';
import Tour from '../models/tourModel.js';

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Review can not be empty!']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Review must belong to a tour.']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user.']
  }
}, {
  toJSON: { virtuals: true },     // enable virtual properties/fields
  toObject: { virtuals: true },    // enable virtual properties/fields
});


// preventing duplicate review
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });


reviewSchema.pre(/^find/, function (next) {
  // "this" points to the current query
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});


// static method on schema, can be called on Model/Document
reviewSchema.statics.calcAverageRatings = async function (tourID) {
  // "this" points to current model
  const stats = await this.aggregate([
    {
      $match: { tour: tourID }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourID, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourID, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};


reviewSchema.post('save', function () {
  // "this" points to the current review/document
  // "this.constructor" points to current model who created the document
  // (we can't use Review as it's not yet declared)
  this.constructor.calcAverageRatings(this.tour);
});


// query hooks, works for "findOneAndUpdate" & "findOneAndDelete" operations
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // attach document/review retrieved to the query as a property
  this.r = await this.clone().findOne();
  next();
});
// query hooks, works for "findOneAndUpdate" & "findOneAndDelete" operations
reviewSchema.post(/^findOneAnd/, async function () {
  // receive attached document/review here after "pre" executed and
  // call calcAverageRatings static method on the document model
  await this.r.constructor.calcAverageRatings(this.r.tour);
});


const Review = mongoose.model('Review', reviewSchema);

export default Review;