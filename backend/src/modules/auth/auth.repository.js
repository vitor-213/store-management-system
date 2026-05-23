import User from "../users/user.model.js";

export const findUserByEmail = async (email) => {
  return await User.findOne({ email }).select("+password");
};

export const findUserById = async (id) => {
  return await User.findById(id).select("name email role isActive");
};

export const createUser = async (userData) => {
  return await User.create(userData);
};
