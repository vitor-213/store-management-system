import jwt from "jsonwebtoken";
import User from "../modules/users/user.model.js";
import ApiError from "../utils/ApiError.js";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized");
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.userId)
    .select("name email role isActive")
    .lean();

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is deactivated");
  }

  req.user = user;
  req.userId = user._id.toString();

  next();
};

export default authMiddleware;
