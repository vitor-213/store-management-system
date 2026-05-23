import { registerService } from "./auth.service.js";

export const register = async (req, res) => {
  try {
    const result = await registerService(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
