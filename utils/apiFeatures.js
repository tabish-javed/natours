/**
 * Query class having methods for modifying query according to the
 * received query params inside request.query
 * @class
 */
class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    /**
     * The filter function removes 'page/sort/limit/fields' parameter from
     * request.query and applies operators to the query.
     * @returns query itself
     */
    filter () {
        // 1A - filtering
        const queryObject = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(element => delete queryObject[element]);

        // 1B- advanced filtering
        let queryStr = JSON.stringify(queryObject);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }

    /**
     * Modify query to enable sorting feature
     * @returns query
     */
    sort () {
        // 2 - sorting
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    /**
     * Modify query to select only supplied fields in request.query
     * @returns query
     */
    limitFields () {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }

    /**
     * If 'page' and 'limit' values are supplied in request.query
     * then send only that page and records limited per page.
     * @returns query
     */
    paginate () {
        const page = +this.queryString.page || 1;
        const limit = +this.queryString.limit || 100;
        const skip = (page - 1) * limit;
        // page=3&limit=10 (1-10 page1, 11-20 page2, 21-30 page3)
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

export default APIFeatures;