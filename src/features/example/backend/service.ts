import { eq } from 'drizzle-orm';
import { db } from '@/backend/db';
import { example } from '@/backend/db/schema';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  ExampleResponseSchema,
  type ExampleResponse,
} from '@/features/example/backend/schema';
import {
  exampleErrorCodes,
  type ExampleServiceError,
} from '@/features/example/backend/error';

const fallbackAvatar = (id: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(id)}/200/200`;

export const getExampleById = async (
  id: string,
): Promise<HandlerResult<ExampleResponse, ExampleServiceError, unknown>> => {
  try {
    const rows = await db
      .select()
      .from(example)
      .where(eq(example.id, id))
      .limit(1);

    const row = rows[0];

    if (!row) {
      return failure(404, exampleErrorCodes.notFound, 'Example not found');
    }

    const mapped = {
      id: row.id,
      fullName: row.fullName ?? 'Anonymous User',
      avatarUrl: row.avatarUrl ?? fallbackAvatar(row.id),
      bio: row.bio,
      updatedAt: row.updatedAt.toISOString(),
    } satisfies ExampleResponse;

    const parsed = ExampleResponseSchema.safeParse(mapped);

    if (!parsed.success) {
      return failure(
        500,
        exampleErrorCodes.validationError,
        'Example payload failed validation.',
        parsed.error.format(),
      );
    }

    return success(parsed.data);
  } catch (e) {
    return failure(
      500,
      exampleErrorCodes.fetchError,
      e instanceof Error ? e.message : 'Unknown error',
    );
  }
};
