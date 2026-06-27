import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        supplier: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalProducts = products.length;

    const totalStock = products.reduce((total, product) => {
      return total + product.stock;
    }, 0);

    const totalInventoryValue = products.reduce((total, product) => {
      return total + product.price * product.stock;
    }, 0);

    const lowStockProducts = products.filter((product) => {
      return product.stock <= product.minStock && product.stock > 0;
    });

    const outOfStockProducts = products.filter((product) => {
      return product.stock === 0;
    });

    const reportItems = products.map((product) => {
      const stockValue = product.price * product.stock;

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category.name,
        supplier: product.supplier?.name ?? "-",
        price: product.price,
        stock: product.stock,
        minStock: product.minStock,
        stockValue,
        status:
          product.stock === 0
            ? "OUT_OF_STOCK"
            : product.stock <= product.minStock
            ? "LOW_STOCK"
            : "AVAILABLE",
      };
    });

    return NextResponse.json({
      success: true,
      message: "Inventory report fetched successfully",
      data: {
        summary: {
          totalProducts,
          totalStock,
          totalInventoryValue,
          lowStockCount: lowStockProducts.length,
          outOfStockCount: outOfStockProducts.length,
        },
        items: reportItems,
      },
    });
  } catch (error) {
    console.error("GET_REPORTS_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch inventory report",
      },
      { status: 500 }
    );
  }
}