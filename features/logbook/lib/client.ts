import { panggilApi } from "@/shared/lib/api-client";

export const panggilLogbook = <T = unknown>(
  metode: Parameters<typeof panggilApi>[1],
  path: string,
  body?: unknown,
  jenis?: string,
) => panggilApi<T>("logbook", metode, path, body, jenis);
