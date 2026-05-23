import {
  getUsersService,
  getUserService,
  updateUserRoleService,
  toggleUserStatusService,
  deleteUserService,
} from "./user.service.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const getUsers = asyncHandler(async (req, res) => {
  const users = await getUsersService();

  res.json({ success: true, data: users });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await getUserService(req.params.id);

  res.json({ success: true, data: user });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await updateUserRoleService(req.params.id, req.body.role);

  res.json({ success: true, data: user });
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await toggleUserStatusService(req.params.id, req.body.isActive);

  res.json({ success: true, data: user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  await deleteUserService(req.params.id);

  res.json({ success: true, message: "User deleted" });
});
