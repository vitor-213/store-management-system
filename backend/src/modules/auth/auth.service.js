import bcrypt from "bcryptjs";

import { findUserByEmail, createUser } from "./auth.repository.js";

import generateToken from "../../utils/generateToken.js";

export const registerService = async ({ name, email, password }) => {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await createUser({
    name,
    email,
    password: hashedPassword,
  });

  const token = generateToken(user._id);

  return {
    user,
    token,
  };
};

export const loginService = async ({ email, password }) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  user.lastLogin = new Date();

  await user.save();

  const token = generateToken(user._id);

  return {
    user,
    token,
  };
};
