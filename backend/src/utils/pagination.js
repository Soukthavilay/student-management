export function parsePagination(query) {
  const page = Number(query.page || 1);
  const pageSize = Number(query.pageSize || 20);

  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safePageSize = Number.isFinite(pageSize)
    ? Math.max(1, Math.min(pageSize, 100))
    : 20;

  return {
    page: safePage,
    pageSize: safePageSize,
    skip: (safePage - 1) * safePageSize,
    take: safePageSize,
  };
}

export function paginationMeta({ page, pageSize, total }) {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}
