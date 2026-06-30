import { withSupabase } from "@supabase/server";

export default {
  fetch: withSupabase({ auth: "publishable" }, async (_req, ctx) => {
    const { data: products } = await ctx.supabase
      .from("products")
      .select("*, category:categories(*)")
      .order("created_at", { ascending: false });

    const { data: categories } = await ctx.supabase
      .from("categories")
      .select("*")
      .order("display_order");

    const { data: featuredProducts } = await ctx.supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("is_featured", true);

    const { data: offerProducts } = await ctx.supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("is_offer", true);

    return Response.json({
      products,
      categories,
      featuredProducts,
      offerProducts,
    });
  }),
};
