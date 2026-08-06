import { generatePhoneOtp } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  phone: z.string().min(10).max(20),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Telefone inválido", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { phone } = parsed.data;
    const normalized = phone.replace(/[^\d+]/g, "");
    const code = generatePhoneOtp(normalized);
    return NextResponse.json({
      ok: true,
      message: "Código enviado por SMS",
      ...(process.env.NODE_ENV === "development" ? { devCode: code } : {}),
    });
  } catch (err) {
    console.error("[OTP] generate error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
