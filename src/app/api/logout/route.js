export async function GET() {

  return new Response(
    JSON.stringify({ success: true }),
    {
      headers: {
        "Set-Cookie": "session=; Path=/; Max-Age=0"
      }
    }
  );

}