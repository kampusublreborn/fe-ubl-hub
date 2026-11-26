import { teruskanKeApi } from "@/features/hub-api";

export function GET(request: Request) {
  return teruskanKeApi(request, [], { prefix: "pencarian", boleh: { GET: /^$/ } });
}
