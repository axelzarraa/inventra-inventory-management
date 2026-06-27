import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export const runtime = "nodejs";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        supplier: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        stockTransactions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error("GET_PRODUCTS_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromToken();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden. Admin only.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      name,
      sku,
      description,
      price,
      stock,
      minStock,
      categoryId,
      supplierId,
    } = body;

    if (!name || !sku || price === undefined || stock === undefined || !categoryId) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, SKU, price, stock, and categoryId are required",
        },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        sku,
      },
    });

    if (existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "SKU already exists",
        },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        description: description || null,
        price: Number(price),
        stock: Number(stock),
        minStock: Number(minStock || 0),
        categoryId: Number(categoryId),
        supplierId: supplierId ? Number(supplierId) : null,
        createdById: user.id,
        stockTransactions: {
          create: {
            type: "IN",
            quantity: Number(stock),
            note: `Stok awal ${name}`,
          },
        },
      },
      include: {
        category: true,
        supplier: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        stockTransactions: true,
      },
    });

    await createAuditLog({
      action: "CREATE_PRODUCT",
      entity: "Product",
      entityId: product.id,
      message: `Created product ${product.name}`,
      userId: user.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE_PRODUCT_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create product",
      },
      { status: 500 }
    );
  }
}