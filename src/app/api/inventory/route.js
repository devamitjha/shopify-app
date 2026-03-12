import { query } from '@/lib/postgres';

export async function GET() {
  try {
    const currentDate = new Date().toISOString().split('T')[0];
    
    const sql = `
      SELECT 
        t1."pieces" AS "pieces",
        T0."location_id" AS "location_id",
        LOC."location_name" AS "location_name",
        T0."item_id" AS "item_id",
        ITM."item_code" AS "item_code",
        ITM."item_name" AS "item_name",
        T0."company_id" AS "company_id",
        CMP."company_name" AS "company_name",
        CMP."external_location_id" as "shopify_location_id",
        ATG."item_group_id" AS "item_group_id",
        ATG."item_group_name" AS "item_group_name",
        ITM."external_product_id" as "shopify product id",
        ITM."external_variant_id" as "shopify product variant id",
        ITM."external_inventory_id" as "shopify product inventory id",
        case when ITM."is_bom" = true then 1 else 0 end AS "is_bom",
        case when t0."is_allocated" = true then 1 else 0 end AS "is_allocated" 
      FROM "inventory"."stock_journal" T0 
      LEFT JOIN "master"."location" LOC ON (LOC."location_id" = T0."location_id") 
      LEFT JOIN "master"."common_attributes" ATG ON (ATG."item_attribute_id" = T0."item_attribute_id") 
      LEFT JOIN "master"."items" ITM ON (ITM."item_id" = T0."item_id") 
      LEFT JOIN "master"."company" CMP ON (CMP."company_id" = T0."company_id") 
      LEFT JOIN "master"."items_sizes" ISZ ON (ISZ."item_size_id" = T0."item_size_id") 
      LEFT JOIN "administration"."documents" DOC ON (DOC."document_id" = T0."document_id") 
      LEFT JOIN "master"."party" PAT ON (PAT."party_id" = T0."party_id") 
      INNER JOIN (
        SELECT 
          MAX(sp."stock_journal_id") AS "stock_journal_id",
          sp."item_id" AS "item_id",
          sp."location_id" AS "location_id",
          sp."item_attribute_id" AS "item_attribute_id",
          SUM(sp."pieces") AS "pieces",
          SUM(sp."weight") AS "weight",
          SUM(sp."pure_weight") AS "pure_weight",
          SUM(sp."net_weight") AS "net_weight",
          SUM(sp."diamond_pieces") AS "diamond_pieces",
          SUM(sp."diamond_weight") AS "diamond_weight",
          SUM(sp."color_stone_pieces") AS "color_stone_pieces",
          SUM(sp."color_stone_weight") AS "color_stone_weight",
          SUM(sp."stone_pieces") AS "stone_pieces",
          SUM(sp."stone_weight") AS "stone_weight",
          SUM(sp."other_pieces") AS "other_pieces",
          SUM(sp."other_weight") AS "other_weight",
          MIN(sp."document_date") AS "fifo_date",
          MAX(sp."document_date") AS "lifo_date" 
        FROM "inventory"."stock_journal" sp 
        WHERE cast(sp."document_date" as date) <= $1 and sp."location_id" != 4
        GROUP BY sp."sku", sp."item_id", sp."item_line_no", sp."item_attribute_id", sp."item_size_id", sp."color_quality_id", sp."location_id", sp."lot_no", sp."certificate_no", sp."company_id" 
        HAVING SUM(sp."weight")>0 AND SUM(sp."pieces")>0
      ) t1 ON (t1."stock_journal_id" = T0."stock_journal_id") 
      ORDER BY T0."item_line_no"
    `;

    const result = await query(sql, [currentDate]);
    return Response.json(result.rows);
  } catch (error) {
    console.error('DATABASE ERROR:', error);
    return Response.json({ 
      error: 'Failed to fetch inventory data', 
      details: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
