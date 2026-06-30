import { withSupabase } from "@supabase/server";

interface CartBody {
  product_id: string;
  quantity: number;
  session_id?: string;
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    const userId = (await ctx.supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (req.method === "GET") {
      const { data, error } = await ctx.supabase
        .from("cart_items")
        .select("*, product:products(*)")
        .eq("user_id", userId);

      if (error) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      return Response.json({ data });
    }

    if (req.method === "POST") {
      const body: CartBody = await req.json();
      const { error } = await ctx.supabase.from("cart_items").insert({
        user_id: userId,
        product_id: body.product_id,
        quantity: body.quantity || 1,
      });

      if (error) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      return Response.json({ success: true });
    }

    if (req.method === "DELETE") {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");
      const clear = searchParams.get("clear");

      if (clear === "true") {
        const { error } = await ctx.supabase
          .from("cart_items")
          .delete()
          .eq("user_id", userId);

        if (error) {
          return Response.json({ error: error.message }, { status: 400 });
        }
        return Response.json({ success: true });
      }

      if (id) {
        const { error } = await ctx.supabase
          .from("cart_items")
          .delete()
          .eq("id", id)
          .eq("user_id", userId);

        if (error) {
          return Response.json({ error: error.message }, { status: 400 });
        }
        return Response.json({ success: true });
      }

      return Response.json({ error: "Missing id or clear parameter" }, { status: 400 });
    }

    if (req.method === "PATCH") {
      const body = await req.json();
      const { error } = await ctx.supabase
        .from("cart_items")
        .update({ quantity: body.quantity })
        .eq("id", body.id)
        .eq("user_id", userId);

      if (error) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      return Response.json({ success: true });
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }),
};
