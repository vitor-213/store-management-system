export const parsePagination = (query, defaults = {}) => {
  const page = Math.max(1, parseInt(query.page) || defaults.page || 1);
  const limit = Math.min(
    defaults.maxLimit || 200,
    Math.max(1, parseInt(query.limit) || defaults.limit || 50),
  );

  return {
    skip: (page - 1) * limit,
    limit,
    page,
  };
};

export const parseSort = (query, defaultSort = { createdAt: -1 }) => {
  if (!query.sort) return defaultSort;

  return query.sort.split(",").reduce((acc, field) => {
    if (field.startsWith("-")) {
      acc[field.slice(1)] = -1;
    } else {
      acc[field] = 1;
    }
    return acc;
  }, {});
};

export const parsePaginationAndSort = (query, defaults = {}) => {
  const pagination = parsePagination(query, defaults);
  const sort = parseSort(query, defaults.defaultSort);

  return {
    ...pagination,
    sort,
  };
};
