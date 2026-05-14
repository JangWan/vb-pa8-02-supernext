import { eq } from 'drizzle-orm';
import { db } from '@/backend/db';
import { users } from '@/backend/db/schema';

type UpsertUserParams = {
  clerkId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
};

export const upsertUser = async (params: UpsertUserParams) => {
  await db
    .insert(users)
    .values({
      clerkId: params.clerkId,
      email: params.email,
      firstName: params.firstName,
      lastName: params.lastName,
      imageUrl: params.imageUrl,
    })
    .onConflictDoUpdate({
      target: users.clerkId,
      set: {
        email: params.email,
        firstName: params.firstName,
        lastName: params.lastName,
        imageUrl: params.imageUrl,
        updatedAt: new Date(),
      },
    });
};

export const deleteUser = async (clerkId: string) => {
  await db.delete(users).where(eq(users.clerkId, clerkId));
};
