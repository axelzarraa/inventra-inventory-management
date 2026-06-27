import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export const runtime = "nodejs";

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
    const body = await request.json();

    const { productId, type, quantity, note } = body;

    if (!productId || !type || !quantity) {
      return NextResponse.json(
        {
          success: false,
          message: "productId, type, and quantity are required",
        },
        { status: 400 }
      );
    }

    if (type !== "IN" && type !== "OUT") {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction type must be IN or OUT",
        },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        id: Number(productId),
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    const transactionQuantity = Number(quantity);

    if (transactionQuantity <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Quantity must be greater than 0",
        },
        { status: 400 }
      );
    }

    if (type === "OUT" && product.stock < transactionQuantity) {
      return NextResponse.json(
        {
          success: false,
          message: "Stock is not enough",
        },
        { status: 400 }
      );
    }

    const updatedStock =
      type === "IN"
        ? product.stock + transactionQuantity
        : product.stock - transactionQuantity;

    const result = await prisma.$transaction(async (tx) => {
  const transaction = await tx.stockTransaction.create({
    data: {
      productId: Number(productId),
      type,
      quantity: transactionQuantity,
      note: note || null,
    },
  });

  const updatedProduct = await tx.product.update({
    where: {
      id: Number(productId),
    },
    data: {
      stock: updatedStock,
    },
    include: {
      category: true,
      supplier: true,
    },
  });

  await tx.auditLog.create({
  data: {
    action: type === "IN" ? "STOCK_IN" : "STOCK_OUT",
    entity: "Product",
    entityId: Number(productId),
    message: `${type} stock ${transactionQuantity} pcs`,
    userId: user.id,
  },
});

  return {
    transaction,
    product: updatedProduct,
  };
});

    return NextResponse.json(
      {
        success: true,
        message: "Stock transaction created successfully",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE_STOCK_TRANSACTION_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create stock transaction",
      },
      { status: 500 }
    );
  }
}