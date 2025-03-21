/* eslint-disable no-console */
import mongoose from 'mongoose';
import slugify from 'slugify';

// define schema for tours documents inside database
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
    // validators
    maxlength: [40, 'A tour name must have less or equal of 40 characters'],
    minlength: [10, 'A tour name must have more or equal of 10 characters'],
    // validate: [validator.isAlpha, 'Tour name must only contain characters']

  },
  slug: {
    type: String
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size']
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
    // validators
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty is either: easy, medium, difficult'
    }
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    // validators
    min: [1, 'Rating must be 1 or above'],
    max: [5, 'Rating must be 5 or less'],
    // set receives a function to change value before it is saved
    set: value => Math.round(value * 10) / 10
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },
  priceDiscount: {
    type: Number,
    // adding custom validator using callback functions
    validate: {
      message: 'Discounted price ({VALUE}) is higher then the price',
      validator: function (value) {
        // "this" keyword only points to current document on NEW document creation
        // it won't work for document update
        return value < this.price;
      }
    }
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a summary']
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false   // disable this filed to be fetched and sent in output
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false
  },
  startLocation: {
    // GeoJSON
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String
  },
  locations: [
    {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number
    }
  ],
  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ],
}, {
  toJSON: { virtuals: true },     // enable virtual properties/fields
  toObject: { virtuals: true }    // enable virtual properties/fields
});


// create index on database for a particular field OR combine multiple fields
// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });


// add virtual fields/properties into documents on retrieval
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});


// VIRTUAL POPULATE - using to avoid child referencing embedded in a list in tour document
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});


// DOCUMENT HOOK: runs before .save() and .create() but not for .insertMany()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});


// IF WE WANT TO EMBED ANOTHER DOCUMENT IN THE DOCUMENT BEFORE SAVING
// tourSchema.pre('save', async function (next) {
//     const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     next();
// });


// find query hook - modify query to also populate User collection data on
// each find query for tours, i.e. getTour, getAllTours etc.
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});


// find query hook - modify query just before execution (control secret tours)
// and (/^find/) regular expression will work for all find operations
tourSchema.pre(/^find/, function (next) {
  // in pre, this points to query
  this.find({ secretTour: { $ne: true } });
  // this.start = Date.now(); <- passes this.start to next hook, where it can be used
  next();
});


// find query hook - runs just after save() completed
// tourSchema.post(/^find/, function (docs, next) {
//     // in post, this points to document
//     console.log(`Query taken: ${Date.now() - this.start} milliseconds`); <- receive this.start here
//     next();
// });


// aggregation query hook - disable secret tours from aggregation (analysis)
tourSchema.pre('aggregate', function (next) {
  this.pipeline().push({ $match: { secretTour: { $ne: true } } });
  // console.log(this.pipeline());
  next();
});


// create model from above document schema to be used to find/aggregate etc.
const Tour = mongoose.model('Tour', tourSchema);

export default Tour;