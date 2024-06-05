class APIFeatures {

    constructor(query, queryString) {
      this.query = query;
      this.queryString = queryString;
    }
  
    filter() {
      //1a) Filtering
      const queryObj = { ...this.queryString };
      const excludedFields = ['page', 'sort', 'limit', 'fields'];
      excludedFields.forEach((eF) => {
        delete queryObj[eF];
      });
  
      //1b) Advance filtering
      let queryString = JSON.stringify(queryObj);
      queryString = queryString.replace(
        /\b(gte|lte|gt|lt)\b/g,
        (match) => `$${match}`,
      );
  
      //execute the query
      this.query = this.query.find(JSON.parse(queryString));
      return this;
    }
  
    sort() {
      //2) Sorting
      if (this.queryString.sort) {
        let sortBy = this.queryString.sort.split(',').join(' ');
        this.query = this.query.sort(sortBy);
      } else {
        this.query = this.query.sort('-createdAt');
      }
      return this;
    }
  
    limitFields() {
      //3) Field limiting

      if (this.queryString.fields) {
        const fields = this.queryString.fields.split(',').join(' ');
        this.query = this.query.select(fields);
      } else {
        this.query = this.query.select('-__v');
      }
      return this;
    }
  
    paginate() {
      //4) Pagination
      const page = this.queryString.page * 1 || 1; //changing string to no.
      const limit = this.queryString.limit * 1 || 100;
      const skip = (page - 1) * limit;
  
      this.query = this.query.skip(skip).limit(limit);
      return this;
  
    }
  }
module.exports=APIFeatures;  