import { withSupabase } from "@supabase/server";

export default {
  fetch: withSupabase({ auth: "publishable" }, async (req, ctx) => {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("q");

    let query = ctx.supabase
      .from("products")
      .select("*, category:categories(*)");

    if (slug) {
      const { data } = await query.eq("slug", slug).maybeSingle();
      return Response.json({ data });
    }

    if (category) {
      query = query.eq("category_id", category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ data });
  }),
};
