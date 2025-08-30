import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // import prisma singleton
export const runtime = "nodejs";

// Describes the JSON we expect from the client (TO BE EDITED)
type Body = {
  email?: string;
  goal?: "lower_payment" | "shorten_term" | "cash_out" | "" | null;
  propertyValue?: number | null;
  currentPrincipal?: number | null;
  currentTermMonths?: number | null;
};

// Handle POST /api/applications
export async function POST(req: NextRequest) {
  try {
    // Parse the JSON body sent by the client
    const body = (await req.json()) as Body;

    // Minimal validation: TO BE DETERMINED, RIGHT NOW MAIL IS REQUIRED
    if (!body?.email || typeof body.email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 }); // bad request
    }

    // If a user with this email exists: return it.
    // Otherwise: create it.
    const user = await prisma.user.upsert({
      where: { email: body.email },
      update: {},
      create: { email: body.email },
    });

    // Creates the application row linked to that user
    const app = await prisma.application.create({
      data: {
        userId: user.id,
        goal: body.goal ?? null,                    // store null when goal is "" or undefined
        propertyValue: body.propertyValue ?? null,  // keep numeric or null
        currentPrincipal: body.currentPrincipal ?? null,
        currentTermMonths: body.currentTermMonths ?? null,
      }});

    // 5) Respond to the client with a stable JSON payload
    return NextResponse.json({ applicationId: app.id }, { status: 201 });
  } catch (err) {
    // In case of any error
    console.error("POST /api/applications error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
