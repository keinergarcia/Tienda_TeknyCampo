import { withSupabase } from "@supabase/server";

interface OrderBody {
  full_name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  notes?: string;
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    const userId = (await ctx.supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (req.method === "GET") {
      const { data, error } = await ctx.supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      return Response.json({ data });
    }

    if (req.method === "POST") {
      const body: OrderBody = await req.json();

      const { data: cartItems, error: cartError } = await ctx.supabase
        .from("cart_items")
        .select("*, product:products(*)")
        .eq("user_id", userId);

      if (cartError) {
        return Response.json({ error: cartError.message }, { status: 400 });
      }

      if (!cartItems || cartItems.length === 0) {
        return Response.json({ error: "Cart is empty" }, { status: 400 });
      }

      const subtotal = cartItems.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0
      );
      const shipping = subtotal >= 100 ? 0 : 15;
      const total = subtotal + shipping;

      const { data: order, error: orderError } = await ctx.supabaseAdmin
        .from("orders")
        .insert({
          user_id: userId,
          status: "pending",
          subtotal,
          shipping,
          total,
          full_name: body.full_name,
          email: body.email,
          phone: body.phone || null,
          address: body.address,
          city: body.city,
          notes: body.notes || null,
        })
        .select()
        .single();

      if (orderError) {
        return Response.json({ error: orderError.message }, { status: 400 });
      }

      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product?.name || "",
        product_price: item.product?.price || 0,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await ctx.supabaseAdmin
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        return Response.json({ error: itemsError.message }, { status: 400 });
      }

      await ctx.supabase
        .from("cart_items")
        .delete()
        .eq("user_id", userId);

      return Response.json({ data: order }, { status: 201 });
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }),
};
