export default {
  secret: process.env.JWT_SECRET || "mysecret",
  expiresIn: "8h",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "myanothersecret",
  refreshExpiresIn: "1d"
};
