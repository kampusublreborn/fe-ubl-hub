import { panggilApi } from "@/shared/lib/api-client";

export const panggilKomunitas = <T = unknown>(
  metode: Parameters<typeof panggilApi>[1],
  path: string,
  body?: unknown,
  jenis?: string,
) => panggilApi<T>("komunitas", metode, path, body, jenis);
