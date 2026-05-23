import {
  findAllUsers,
  findUserById,
  updateUserById,
  deleteUserById,
} from "./user.repository.js";
import ApiError from "../../utils/ApiError.js";

export const getUsersService = async () => {
  return await findAllUsers();
};

export const getUserService = async (id) => {
  const user = await findUserById(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

export const updateUserRoleService = async (id, role) => {
  const user = await updateUserById(id, { role });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

export const toggleUserStatusService = async (id, isActive) => {
  const user = await updateUserById(id, { isActive });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

export const deleteUserService = async (id) => {
  const user = await deleteUserById(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};
