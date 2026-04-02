import type { z } from "zod";

export function zodResolver<TSchema extends z.ZodTypeAny>(schema: TSchema) {
  return (values: z.input<TSchema>) => {
    const result = schema.safeParse(values);

    if (result.success) {
      return { values: result.data, errors: {} as Record<string, { message: string }> };
    }

    const errors = Object.fromEntries(
      Object.entries(result.error.flatten().fieldErrors).flatMap(([key, value]) => {
        const message = value?.[0];
        return message ? [[key, { message }]] : [];
      }),
    );

    return {
      values: values as z.output<TSchema>,
      errors,
    };
  };
}
