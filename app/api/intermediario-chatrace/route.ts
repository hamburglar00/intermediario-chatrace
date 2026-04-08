import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const LANDING_PHONE_BASE_URL =
  "https://fdkjkzpjqfbaavylapun.supabase.co/functions/v1/landing-phone";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function normalizePhone(raw: unknown): string {
  let phone = String(raw ?? "").replace(/\D+/g, "").trim();

  if (phone.length === 10) {
    phone = `54${phone}`;
  }

  return phone;
}

function buildPromoCode(name: string): string {
  const uuidSegment = generateUUID().replace(/-/g, "").slice(0, 12);
  return `${name}-${uuidSegment}`;
}

async function getAssignedPhone(name: string): Promise<string> {
  const url =
    `${LANDING_PHONE_BASE_URL}` +
    `?name=${encodeURIComponent(name)}` +
    `&source=chatrace`;

  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`landing-phone respondió ${res.status}`);
  }

  const data = await res.json();

  const candidate =
    data?.number ??
    data?.phone ??
    data?.telefono ??
    data?.telefono_asignado ??
    data?.data?.number ??
    data?.data?.phone;

  const phone = normalizePhone(candidate);

  if (!phone || phone.length < 8) {
    throw new Error("No se pudo obtener un teléfono válido");
  }

  return phone;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = (searchParams.get("name") || "").trim();

    if (!name) {
      return NextResponse.json(
        { ok: false, error: 'Falta el parámetro "name"' },
        { status: 400 }
      );
    }

    const telefono_asignado = await getAssignedPhone(name);

    const now = new Date();
    const timestamp = now.toISOString();
    const event_time = Math.floor(now.getTime() / 1000);

    const external_id = generateUUID();
    const event_id = generateUUID();
    const promo_code = buildPromoCode(name);

    return NextResponse.json(
      {
        promo_code,
        external_id,
        event_id,
        timestamp,
        event_time,
        telefono_asignado,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error interno inesperado";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
