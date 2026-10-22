function normalizeBannerLink(link) {
  if (typeof link !== 'string') return null;

  const normalized = link.trim();
  return normalized || null;
}

module.exports = { normalizeBannerLink };
