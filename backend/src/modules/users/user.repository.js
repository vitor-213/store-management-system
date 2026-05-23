import User from "./user.model.js";

export const findAllUsers = async () => {
  return await User.find().select("-password");
};

export const findUserById = async (id) => {
  return await User.findById(id).select("-password");
};

export const updateUserById = async (id, updateData) => {
  return await User.findByIdAndUpdate(id, updateData, {
    new: true,
  }).select("-password");
};

export const deleteUserById = async (id) => {
  return await User.findByIdAndDelete(id);
};
