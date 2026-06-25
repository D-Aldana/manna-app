// Stable indirection: the app points here, this redirects to whatever donation
// tool we currently use. Swap tools by updating the secret — no app rebuild.
Deno.serve(() => {
  const target = Deno.env.get("SUPPORT_REDIRECT_URL")
  if (!target) {
    return new Response("Support link is not configured yet.", {
      status: 503,
      headers: { "Content-Type": "text/plain" },
    })
  }
  return Response.redirect(target, 302)
})
