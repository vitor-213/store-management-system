import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/modules/users/user.model.js";
import connectDB from "../src/config/db.js";

const seedUsers = async () => {
  await connectDB();

  // Limpiar usuarios existentes (opcional)
  // await User.deleteMany({});

  const users = [
    {
      name: "Admin User",
      email: "admin@tienda.com",
      password: await bcrypt.hash("12345678", 10),
      role: "admin",
      isActive: true,
    },
    {
      name: "Manager User",
      email: "manager@tienda.com",
      password: await bcrypt.hash("12345678", 10),
      role: "manager",
      isActive: true,
    },
    {
      name: "Employee User",
      email: "employee@tienda.com",
      password: await bcrypt.hash("12345678", 10),
      role: "employee",
      isActive: true,
    },
  ];

  for (const user of users) {
    const exists = await User.findOne({ email: user.email });
    if (!exists) {
      await User.create(user);
      console.log(`✅ Usuario creado: ${user.email} (${user.role})`);
    } else {
      console.log(`⏭️ Usuario ya existe: ${user.email}`);
    }
  }

  console.log("✅ Seed completado!");
  process.exit(0);
};

seedUsers().catch((error) => {
  console.error("❌ Error en seed:", error);
  process.exit(1);
});
