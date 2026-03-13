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

export async function POST(req) {
  try {
    const { inventoryData } = await req.json();

    if (!inventoryData || !Array.isArray(inventoryData)) {
      return Response.json({ error: 'Invalid inventory data provided' }, { status: 400 });
    }

    const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
    const SHOPIFY_STORE = process.env.SHOPIFY_STORE;

    if (!ADMIN_TOKEN || !SHOPIFY_STORE) {
      return Response.json({ error: 'Shopify configuration missing in .env' }, { status: 500 });
    }

    // Filter items without Shopify Inventory ID
    const validItems = inventoryData.filter(item => 
      item["shopify product inventory id"] && 
      String(item["shopify product inventory id"]).trim() !== ""
    );

    // Group by (item_code, shopify_location_id) and sum pieces
    // Note: User said "Item Code and Shopify LOC ID will be same then add Pieces"
    const groupedData = validItems.reduce((acc, item) => {
      const key = `${item.item_code}-${item.shopify_location_id}`;
      if (!acc[key]) {
        acc[key] = {
          inventoryItemId: `gid://shopify/InventoryItem/${item["shopify product inventory id"]}`,
          locationId: `gid://shopify/Location/${item.shopify_location_id}`,
          quantity: 0,
          item_code: item.item_code
        };
      }
      acc[key].quantity += Number(item.pieces || 0);
      return acc;
    }, {});

    const setQuantities = Object.values(groupedData).map(group => ({
      inventoryItemId: group.inventoryItemId,
      locationId: group.locationId,
      quantity: group.quantity
    }));

    if (setQuantities.length === 0) {
      return Response.json({ message: 'No valid items to update', updatedCount: 0 });
    }

    // Shopify GraphQL API call
    // inventorySetOnHandQuantities (introduced in 2023-10)
    // Up to 250 inventory quantities can be set at once.
    
    const query = `
      mutation inventorySetOnHandQuantities($input: InventorySetOnHandQuantitiesInput!) {
        inventorySetOnHandQuantities(input: $input) {
          userErrors {
            field
            message
          }
          inventoryAdjustmentGroup {
            createdAt
          }
        }
      }
    `;

    const batchSize = 250;
    const allUserErrors = [];
    let successfulUpdates = 0;

    for (let i = 0; i < setQuantities.length; i += batchSize) {
      const batch = setQuantities.slice(i, i + batchSize);
      
      // Prepare the input for Shopify (only allowed fields)
      const inputQuantities = batch.map(item => ({
        inventoryItemId: item.inventoryItemId,
        locationId: item.locationId,
        quantity: item.quantity
      }));

      const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': ADMIN_TOKEN,
        },
        body: JSON.stringify({
          query,
          variables: {
            input: {
              reason: "correction",
              setQuantities: inputQuantities
            }
          }
        }),
      });

      const result = await response.json();

      if (result.errors) {
        return Response.json({ 
          error: 'Shopify API Error', 
          details: result.errors, 
          updatedCount: successfulUpdates,
          failedCount: setQuantities.length - successfulUpdates
        }, { status: 500 });
      }

      const userErrors = result.data?.inventorySetOnHandQuantities?.userErrors || [];
      if (userErrors.length > 0) {
        // Map index-based errors to actual item data
        const errorIndices = new Set();
        userErrors.forEach(err => {
          const index = parseInt(err.field[2]);
          errorIndices.add(index);
          const failedItem = batch[index];
          allUserErrors.push({
            item_code: failedItem.item_code,
            inventoryItemId: failedItem.inventoryItemId,
            locationId: failedItem.locationId,
            quantity: failedItem.quantity,
            message: err.message
          });
        });
        successfulUpdates += (batch.length - errorIndices.size);
      } else {
        successfulUpdates += batch.length;
      }
    }

    if (allUserErrors.length > 0) {
      return Response.json({ 
        error: 'Inventory update completed with some errors', 
        details: allUserErrors,
        updatedCount: successfulUpdates,
        failedCount: allUserErrors.length,
        totalAttempted: setQuantities.length
      }, { status: 200 }); // Changed to 200 because it partial succeeded and we want to show the table
    }

    return Response.json({ 
      message: 'Inventory updated successfully', 
      updatedCount: successfulUpdates,
      totalAttempted: setQuantities.length
    });

  } catch (error) {
    console.error('INVENTORY UPDATE ERROR:', error);
    return Response.json({ 
      error: 'Failed to update inventory', 
      details: error.message 
    }, { status: 500 });
  }
}
