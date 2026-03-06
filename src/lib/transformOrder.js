export const transformOrder = (order) => {

  const items = order.line_items.map(item => {

    let props = {};

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
      total_discount: parseFloat(item.total_discount),

      gold_price_per_gram: parseFloat(props["_Gold Price Per Gram"] || 0),
      gold_weight: parseFloat(props["_Gold Weight"] || 0),
      gold_price: parseFloat(props["_Gold Price"] || 0),
      making_charges: parseFloat(props["_Making Charges"] || 0),
      diamond_charges: parseFloat(props["_Diamond Charges"] || 0)
    };
  });

  return {
    channel: 4,
    order: {
      order_id: order.id,
      order_no: order.order_number,
      status: order.financial_status,
      created_date: order.created_at,

      customer: order.customer,

      shipping_address: order.shipping_address,

      billing_address: order.billing_address,

      items: items,

      discounts: order.discount_applications
    }
  };
};