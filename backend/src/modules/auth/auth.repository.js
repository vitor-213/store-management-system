import User from "../users/user.model.js";

export const findUserByEmail = async (email) => {
  return await User.findOne({ email }).select("+password");
};

export const createUser = async (userData) => {
  return await User.create(userData);
};
