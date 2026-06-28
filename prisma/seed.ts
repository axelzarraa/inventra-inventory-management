import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  const hashedStaffPassword = await bcrypt.hash("staff123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@inventra.com" },
    update: {},
    create: {
      name: "Admin Inventra",
      email: "admin@inventra.com",
      password: hashedAdminPassword,
      role: "ADMIN",
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@inventra.com" },
    update: {},
    create: {
      name: "Staff Inventra",
      email: "staff@inventra.com",
      password: hashedStaffPassword,
      role: "STAFF",
    },
  });

  console.log("Admin created:", admin.email);
  console.log("Staff created:", staff.email);

  const category = await prisma.category.upsert({
    where: { name: "Elektronik" },
    update: {},
    create: { name: "Elektronik" },
  });

  const supplier = await prisma.supplier.upsert({
    where: { id: 1 },
    update: {
      name: "PT Sumber Teknologi",
      phone: "081234567890",
      address: "Jakarta, Indonesia",
    },
    create: {
      name: "PT Sumber Teknologi",
      phone: "081234567890",
      address: "Jakarta, Indonesia",
    },
  });

  await prisma.product.upsert({
    where: { sku: "PRD-001" },
    update: {},
    create: {
      name: "Mouse Wireless Logitech",
      sku: "PRD-001",
      description: "Mouse wireless untuk kebutuhan kantor dan produktivitas.",
      price: 150000,
      stock: 25,
      minStock: 5,
      categoryId: category.id,
      supplierId: supplier.id,
      createdById: admin.id,
    },
  });

  await prisma.product.upsert({
    where: { sku: "PRD-002" },
    update: {},
    create: {
      name: "Keyboard Mechanical",
      sku: "PRD-002",
      description: "Keyboard mechanical untuk kerja dan gaming ringan.",
      price: 350000,
      stock: 12,
      minStock: 3,
      categoryId: category.id,
      supplierId: supplier.id,
      createdById: admin.id,
    },
  });

  console.log("Seed data berhasil dibuat.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });