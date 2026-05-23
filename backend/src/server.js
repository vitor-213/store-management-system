import dotenv from "dotenv";

dotenv.config();

import validateEnv from "./config/env.js";
import app from "./app.js";
import connectDB from "./config/db.js";

validateEnv();

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
