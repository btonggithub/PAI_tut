const toSafeUser = (user) => {
  if (!user) {
    return null;
  }

  const rawId = user.id || user._id;
  const id = rawId ? rawId.toString() : undefined;

  return {
    id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const toSafeUsers = (users = []) => users.map(toSafeUser);

module.exports = {
  toSafeUser,
  toSafeUsers,
};