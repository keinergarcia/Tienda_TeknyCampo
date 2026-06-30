import { withSupabase } from "@supabase/server";

export default {
  fetch: withSupabase({ auth: "publishable" }, async (req, ctx) => {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (req.method === "POST" && action === "signup") {
      const { email, password, full_name } = await req.json();
      const { data, error } = await ctx.supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name, role: "user" } },
      });

      if (error) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      return Response.json({ data: { user: data.user } });
    }

    if (req.method === "POST" && action === "signin") {
      const { email, password } = await req.json();
      const { data, error } = await ctx.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return Response.json({ error: error.message }, { status: 401 });
      }
      return Response.json({ data: { user: data.user, session: data.session } });
    }

    if (req.method === "POST" && action === "signout") {
      const { error } = await ctx.supabase.auth.signOut();
      if (error) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      return Response.json({ success: true });
    }

    if (req.method === "GET" && action === "me") {
      const { data, error } = await ctx.supabase.auth.getUser();
      if (error) {
        return Response.json({ error: error.message }, { status: 401 });
      }
      return Response.json({ data: { user: data.user } });
    }

    return Response.json({ error: "Invalid request" }, { status: 400 });
  }),
};
