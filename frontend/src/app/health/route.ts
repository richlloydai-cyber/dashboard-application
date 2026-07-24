export const dynamic = "force-static";

export function GET() {
  return new Response("healthy\n", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}