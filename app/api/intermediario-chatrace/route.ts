import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const LANDING_PHONE_BASE_URL =
  "https://fdkjkzpjqfbaavylapun.supabase.co/functions/v1/landing-phone";
const PHONE_TIMEOUT_MS = 6000;
const PHONE_RETRY_ATTEMPTS = 3;
const PHONE_RETRY_BACKOFF_MS = 400;

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

function normalizeEmail(raw: unknown): string {
  return String(raw ?? "").trim().toLowerCase();
}

function isLikelyEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isLikelyPhone(value: string): boolean {
  const normalized = normalizePhone(value);
  return normalized.length >= 8;
}

function buildPromoCode(name: string): string {
  const uuidSegment = generateUUID().replace(/-/g, "").slice(0, 12);
  const normalizedName = name.trim().toLowerCase();
  const namePrefix = normalizedName.slice(0, 3) || "usr";
  return `${namePrefix}-${uuidSegment}`;
}

function buildWhatsappMessage(promoCode: string): string {
  const variants = [
    "Hola! Vi este anuncio, me pasas info?",
    "Hola! Vi el anuncio, podrias darme mas info?",
    "Buenas! Me contas un poco mas del anuncio?",
    "Hola! Quisiera saber mas sobre lo que ofrecen.",
    "Buenas! Me das mas detalles por favor?",
    "Hola! Estoy interesado, me contas como funciona?",
    "Hola! Vi tu publicacion, podrias ampliarme la info?",
    "Holaaa! Me llamo la atencion el anuncio, me contas mas?",
    "Hola! Vi tu publicidad, como es para registrarse?",
    "Buenas! Me das informacion sobre como empezar?",
  ];

  const base = variants[Math.floor(Math.random() * variants.length)];
  return promoCode ? `${base} ${promoCode}` : base;
}

function buildWhatsappLink(phone: string, promoCode: string): string {
  const message = buildWhatsappMessage(promoCode);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type RequestPayload = Record<string, unknown> & {
  name?: unknown;
  external_id?: unknown;
};

type NormalizedUserData = {
  phone?: string;
  email?: string;
};

async function parseJsonBody(req: NextRequest): Promise<RequestPayload> {
  const contentType = req.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return {};
  }

  try {
    const body = (await req.json()) as RequestPayload | null;
    return body ?? {};
  } catch {
    return {};
  }
}

function getStringValue(value: unknown): string {
  return String(value ?? "").trim();
}

function extractName(req: NextRequest, body: RequestPayload): string {
  const { searchParams } = new URL(req.url);
  return getStringValue(searchParams.get("name") ?? body.name);
}

function extractExternalId(req: NextRequest, body: RequestPayload): string {
  const { searchParams } = new URL(req.url);
  const explicitExternalId = getStringValue(
    searchParams.get("external_id") ?? body.external_id
  );

  return explicitExternalId || generateUUID();
}

function collectInputCandidates(req: NextRequest, body: RequestPayload): string[] {
  const { searchParams } = new URL(req.url);
  const values: string[] = [];

  for (const value of searchParams.values()) {
    const str = getStringValue(value);
    if (str) {
      values.push(str);
    }
  }

  for (const value of Object.values(body)) {
    if (typeof value === "string" || typeof value === "number") {
      const str = getStringValue(value);
      if (str) {
        values.push(str);
      }
    }
  }

  return values;
}

function detectNormalizedUserData(
  req: NextRequest,
  body: RequestPayload
): NormalizedUserData {
  const { searchParams } = new URL(req.url);
  const explicitEmail =
    searchParams.get("email") ??
    searchParams.get("em") ??
    getStringValue(body.email) ??
    getStringValue(body.em);

  const explicitPhone =
    searchParams.get("phone") ??
    searchParams.get("telefono") ??
    searchParams.get("ph") ??
    getStringValue(body.phone) ??
    getStringValue(body.telefono) ??
    getStringValue(body.ph);

  const candidates = collectInputCandidates(req, body);

  let foundEmail = normalizeEmail(explicitEmail);
  if (!isLikelyEmail(foundEmail)) {
    foundEmail = "";
  }

  let foundPhone = normalizePhone(explicitPhone);
  if (!isLikelyPhone(foundPhone)) {
    foundPhone = "";
  }

  for (const candidate of candidates) {
    if (!foundEmail) {
      const normalizedEmail = normalizeEmail(candidate);
      if (isLikelyEmail(normalizedEmail)) {
        foundEmail = normalizedEmail;
      }
    }

    if (!foundPhone) {
      const normalizedPhone = normalizePhone(candidate);
      if (isLikelyPhone(normalizedPhone)) {
        foundPhone = normalizedPhone;
      }
    }

    if (foundEmail && foundPhone) {
      break;
    }
  }

  const result: NormalizedUserData = {};

  if (foundPhone) {
    result.phone = foundPhone;
  }

  if (foundEmail) {
    result.email = foundEmail;
  }

  return result;
}

async function requestPhone(name: string): Promise<string> {
  const url =
    `${LANDING_PHONE_BASE_URL}` +
    `?name=${encodeURIComponent(name)}` +
    `&source=chatrace`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PHONE_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`landing-phone respondio ${res.status}`);
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
      throw new Error("No se pudo obtener un telefono valido");
    }

    return phone;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Timeout consultando landing-phone (${PHONE_TIMEOUT_MS}ms)`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function getAssignedPhone(name: string): Promise<string> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= PHONE_RETRY_ATTEMPTS; attempt += 1) {
    try {
      return await requestPhone(name);
    } catch (error) {
      lastError = error;

      if (attempt < PHONE_RETRY_ATTEMPTS) {
        await sleep(PHONE_RETRY_BACKOFF_MS * attempt);
      }
    }
  }

  const message =
    lastError instanceof Error ? lastError.message : "Error desconocido";
  throw new Error(`No fue posible obtener telefono luego de reintentos: ${message}`);
}

async function handleRequest(req: NextRequest) {
  try {
    const body = await parseJsonBody(req);
    const name = extractName(req, body);

    if (!name) {
      return NextResponse.json(
        { ok: false, error: 'Falta el parametro "name"' },
        { status: 400 }
      );
    }

    const telefono_asignado = await getAssignedPhone(name);
    const userData = detectNormalizedUserData(req, body);

    const now = new Date();
    const timestamp = now.toISOString();
    const event_time = Math.floor(now.getTime() / 1000);

    const external_id = extractExternalId(req, body);
    const event_id = generateUUID();
    const promo_code = buildPromoCode(name);
    const whatsapp_link = buildWhatsappLink(telefono_asignado, promo_code);

    return NextResponse.json(
      {
        promo_code,
        whatsapp_link,
        external_id,
        event_id,
        timestamp,
        event_time,
        telefono_asignado,
        ...userData,
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
      { status: 503 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleRequest(req);
}

export async function POST(req: NextRequest) {
  return handleRequest(req);
}
