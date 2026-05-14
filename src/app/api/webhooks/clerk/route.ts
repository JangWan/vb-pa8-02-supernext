import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import { createServiceClient } from "@/backend/supabase/client";
import { upsertUser, deleteUser } from "@/features/auth/backend/service";

const getSupabaseServiceClient = () =>
  createServiceClient({
    url: process.env.SUPABASE_URL!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  });

export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch {
    return new Response("Webhook 서명 검증 실패", { status: 400 });
  }

  const supabase = getSupabaseServiceClient();

  try {
    if (evt.type === "user.created" || evt.type === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;

      await upsertUser(supabase, {
        clerkId: id,
        email: email_addresses[0]?.email_address ?? null,
        firstName: first_name ?? null,
        lastName: last_name ?? null,
        imageUrl: image_url ?? null,
      });
    }

    if (evt.type === "user.deleted") {
      const { id } = evt.data;
      if (id) {
        await deleteUser(supabase, id);
      }
    }
  } catch (error) {
    console.error("Webhook 처리 오류:", error);
    return new Response("서버 오류", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
