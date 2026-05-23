import bcrypt from "bcryptjs";
import { findUserByEmail, findUserById, createUser } from "./auth.repository.js";
import generateToken from "../../utils/generateToken.js";
import ApiError from "../../utils/ApiError.js";

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
});

export const registerService = async ({ name, email, password }) => {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await createUser({
    name,
    email,
    password: hashedPassword,
  });

  const token = generateToken(user._id);

  return {
    user: sanitizeUser(user),
    token,
  };
};

export const loginService = async ({ email, password }) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is deactivated");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id);

  return {
    user: sanitizeUser(user),
    token,
  };
};

export const getMeService = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return sanitizeUser(user);
};
