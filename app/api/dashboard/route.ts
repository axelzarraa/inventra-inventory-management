import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [
      totalProducts,
      totalCategories,
      totalSuppliers,
      products,
      recentTransactions,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.supplier.count(),

      prisma.product.findMany({
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.stockTransaction.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
      }),
    ]);

    const totalStock = products.reduce((total, product) => {
      return total + product.stock;
    }, 0);

    const lowStockProducts = products.filter((product) => {
      return product.stock <= product.minStock;
    });

    return NextResponse.json({
      success: true,
      message: "Dashboard summary fetched successfully",
      data: {
      totalProducts,
      totalCategories,
      totalSuppliers,
      totalStock,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      recentTransactions,
      stockChartData: products.map((product) => ({
        name: product.name,
        stock: product.stock,
      })),
    },
    });
  } catch (error) {
    console.error("GET_DASHBOARD_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load dashboard",
      },
      { status: 500 }
    );
  }
}