export function buildMarketplacePayload(order) {

  const phone =
    order.phone ||
    order.customer?.phone ||
    order.shipping_address?.phone ||
    order.billing_address?.phone ||
    "";

  return {
    channel: 4,

    order: {
      order_id: order.id,
      order_no: order.order_number,
      status: order.financial_status,

      customer: {
        id: order.customer?.id,
        first_name: order.customer?.first_name,
        last_name: order.customer?.last_name,
        email: order.customer?.email,
        phone: phone,
        currency: order.currency || "INR",
        state: order.customer?.state || "enabled",
        note: order.note || "",
        verified_email: order.customer?.verified_email ?? true,
        tax_exempt: order.customer?.tax_exempt ?? false
      },

      shipping_address: {
        first_name: order.shipping_address?.first_name,
        last_name: order.shipping_address?.last_name,
        name: order.shipping_address?.name,
        address: order.shipping_address?.address1,
        address1: order.shipping_address?.address2 || "",
        city: order.shipping_address?.city,
        zip: order.shipping_address?.zip,
        province: order.shipping_address?.province,
        country: order.shipping_address?.country,
        phone: order.shipping_address?.phone || phone,
        company: order.shipping_address?.company || "",
        country_code: order.shipping_address?.country_code,
        province_code: order.shipping_address?.province_code
      },

      billing_address: {
        first_name: order.billing_address?.first_name,
        last_name: order.billing_address?.last_name,
        name: order.billing_address?.name,
        address: order.billing_address?.address1,
        address1: order.billing_address?.address2 || "",
        city: order.billing_address?.city,
        zip: order.billing_address?.zip,
        province: order.billing_address?.province,
        country: order.billing_address?.country,
        phone: order.billing_address?.phone || phone,
        company: order.billing_address?.company || "",
        country_code: order.billing_address?.country_code,
        province_code: order.billing_address?.province_code
      },

      items: order.line_items?.map(item => {

        const props = {};
        item.properties?.forEach(p => {
          props[p.name] = p.value;
        });

        return {
          line_item_id: item.id,
          sku: item.sku,
          title: item.title,
          quantity: item.quantity,
          price: parseFloat(item.price),
          product_exists: item.product_exists,
          product_id: item.product_id,
          requires_shipping: item.requires_shipping,
          taxable: item.taxable,
          total_discount: parseFloat(item.total_discount || 0),

          color_quality: "",
          karat: "",

          gold_price_per_gram: parseFloat(props["_Gold Price Per Gram"] || 0),
          gold_weight: parseFloat(props["_Gold Weight"] || 0),
          gold_price: parseFloat(props["_Gold Price"] || 0),
          making_charges: parseFloat(props["_Making Charges"] || 0),
          diamond_charges: parseFloat(props["_Diamond Charges"] || 0)
        };

      }) || [],

      discounts: order.discount_codes?.map(d => ({
        target_type: "line_item",
        type: "percentage",
        value: parseFloat(d.amount),
        value_type: d.type || "fixed_amount",
        allocation_method: "across",
        target_selection: "all",
        code: d.code
      })) || [],

      created_date: order.created_at
    }
  };
}