/**
 * Generate a URL-safe slug from a string (e.g. "Dr. Ananya Sharma" -> "dr-ananya-sharma")
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove special characters except spaces & hyphens
    .replace(/[\s_]+/g, '-')      // replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, '');     // trim leading/trailing hyphens
};

/**
 * Generate a unique slug by checking database collisions
 */
const generateUniqueSlug = async (baseName, TherapistModel, currentId = null) => {
  let baseSlug = slugify(baseName) || 'therapist';
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (currentId) {
      query._id = { $ne: currentId };
    }
    const existing = await TherapistModel.findOne(query);
    if (!existing) {
      return slug;
    }
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
};

module.exports = {
  slugify,
  generateUniqueSlug
};
