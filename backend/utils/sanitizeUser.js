// Never send password_hash or internal fields to the client.
function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, google_id, ...safe } = user;
  return safe;
}

module.exports = sanitizeUser;
