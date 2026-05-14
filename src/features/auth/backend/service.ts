import type { SupabaseClient } from "@supabase/supabase-js";

type UpsertUserParams = {
  clerkId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
};

export const upsertUser = async (
  supabase: SupabaseClient,
  params: UpsertUserParams
) => {
  const { error } = await supabase.from("users").upsert(
    {
      clerk_id: params.clerkId,
      email: params.email,
      first_name: params.firstName,
      last_name: params.lastName,
      image_url: params.imageUrl,
    },
    { onConflict: "clerk_id" }
  );

  if (error) {
    throw new Error(`사용자 동기화 실패: ${error.message}`);
  }
};

export const deleteUser = async (
  supabase: SupabaseClient,
  clerkId: string
) => {
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("clerk_id", clerkId);

  if (error) {
    throw new Error(`사용자 삭제 실패: ${error.message}`);
  }
};
