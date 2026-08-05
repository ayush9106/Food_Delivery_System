const { Op } = require("sequelize");

/**
 * ApiFeatures — small query-string helper for pagination, sorting,
 * searching and filtering. Keeps list controllers consistent.
 *
 * Usage: new ApiFeatures(Model.findAndCountAll, req.query)
 *          .filter(whitelist).search(fields).sort().paginate();
 */
class ApiFeatures {
  constructor(model, query) {
    this.model = model;
    this.query = query;
    this.where = {};
    this.order = [];
    this.limit = null;
    this.offset = null;
  }

  filter(whitelist = []) {
    const { page, limit, sort, search, ...rest } = this.query;
    whitelist.forEach((key) => {
      if (rest[key] !== undefined && rest[key] !== null && rest[key] !== "") {
        this.where[key] = rest[key];
      }
    });
    return this;
  }

  search(fields = []) {
    const { search } = this.query;
    if (search && fields.length) {
      this.where[Op.or] = fields.map((f) => ({
        [f]: { [Op.like]: `%${search}%` },
      }));
    }
    return this;
  }

  sort(defaultField = "createdAt", defaultOrder = "DESC") {
    const { sort } = this.query;
    if (sort) {
      const [field, direction] = sort.split(":");
      this.order = [[field, (direction || "ASC").toUpperCase()]];
    } else {
      this.order = [[defaultField, defaultOrder]];
    }
    return this;
  }

  paginate(defaultPage = 1, defaultLimit = 10) {
    const page = parseInt(this.query.page, 10) || defaultPage;
    const limit = parseInt(this.query.limit, 10) || defaultLimit;
    this.limit = limit;
    this.offset = (page - 1) * limit;
    this.page = page;
    return this;
  }

  async execute() {
    const options = { where: this.where, distinct: true };
    if (this.order.length) options.order = this.order;
    if (this.limit) {
      options.limit = this.limit;
      options.offset = this.offset;
    }
    const { count, rows } = await this.model.findAndCountAll(options);
    return {
      results: rows,
      total: count,
      page: this.page || 1,
      totalPages: Math.ceil(count / (this.limit || count || 1)),
    };
  }
}

module.exports = ApiFeatures;
