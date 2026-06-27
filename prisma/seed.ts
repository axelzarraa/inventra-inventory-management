import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "inventra_db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@inventra.com" },
    update: {},
    create: {
      name: "Admin Inventra",
      email: "admin@inventra.com",
      password: "admin123",
      role: "ADMIN",
    },
  });

  const staff = await prisma.user.upsert({
  where: {
  email: "staff@inventra.com",
  },
  update: {},
  create: {
    name: "Staff Inventra",
    email: "staff@inventra.com",
    password: "staff123",
    role: "STAFF",
  },
});

console.log("Staff created:", staff.email); 

  const category = await prisma.category.upsert({
    where: { name: "Elektronik" },
    update: {},
    create: {
      name: "Elektronik",
    },
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
    update: {
      name: "Mouse Wireless Logitech",
      description: "Mouse wireless untuk kebutuhan kantor dan produktivitas.",
      price: 150000,
      stock: 25,
      minStock: 5,
      categoryId: category.id,
      supplierId: supplier.id,
      createdById: admin.id,
    },
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
    update: {
      name: "Keyboard Mechanical",
      description: "Keyboard mechanical untuk kerja dan gaming ringan.",
      price: 350000,
      stock: 12,
      minStock: 3,
      categoryId: category.id,
      supplierId: supplier.id,
      createdById: admin.id,
    },
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

  await prisma.stockTransaction.create({
    data: {
      type: "IN",
      quantity: 25,
      note: "Stok awal Mouse Wireless Logitech",
      product: {
        connect: {
          sku: "PRD-001",
        },
      },
    },
  });

  await prisma.stockTransaction.create({
    data: {
      type: "IN",
      quantity: 12,
      note: "Stok awal Keyboard Mechanical",
      product: {
        connect: {
          sku: "PRD-002",
        },
      },
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