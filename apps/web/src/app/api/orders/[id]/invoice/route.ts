import { getOrderById, getStoreDb } from "@obsidian/data";
import { getTaxClass } from "@obsidian/commerce";
import { currentStoreId } from "@/lib/tenant";
import { formatDate, money } from "@/lib/format";

/**
 * Printable tax invoice.
 *
 * Rendered as a self-contained HTML document so it opens instantly and prints
 * (or saves as PDF) from the browser without pulling in a PDF toolchain.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const storeId = await currentStoreId();
  const order = getOrderById(storeId, id);

  if (!order) {
    return new Response("Order not found", { status: 404 });
  }

  const db = getStoreDb(storeId);
  const intraState = order.shippingAddress.state === "Karnataka";
  const half = Math.round(order.tax / 2);

  const rows = order.items
    .map((item) => {
      const product = db.products.find((p) => p.id === item.productId);
      const rate = getTaxClass(product?.taxClassId).rate;
      return `
        <tr>
          <td>
            <strong>${escapeHtml(item.name)}</strong>
            ${item.variantTitle !== "Default" ? `<div class="muted">${escapeHtml(item.variantTitle)}</div>` : ""}
            <div class="muted">SKU ${escapeHtml(item.sku)}</div>
          </td>
          <td class="num">${rate}%</td>
          <td class="num">${item.quantity}</td>
          <td class="num">${money(item.unitPrice)}</td>
          <td class="num">${money(item.total)}</td>
        </tr>`;
    })
    .join("");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Invoice ${order.orderNumber} — ${escapeHtml(db.store.name)}</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 40px 32px; font: 13px/1.6 ui-sans-serif, system-ui, "Segoe UI", sans-serif; color: #12140f; background: #f4f0e7; }
  .sheet { max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; border: 1px solid #e4dfd3; }
  header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #080908; padding-bottom: 20px; }
  .brand { font-size: 22px; letter-spacing: .14em; text-transform: uppercase; font-weight: 600; }
  .muted { color: #6e7268; font-size: 11.5px; }
  h1 { font-size: 15px; letter-spacing: .12em; text-transform: uppercase; margin: 0 0 4px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin: 26px 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { text-align: left; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: #6e7268; border-bottom: 1px solid #e4dfd3; padding: 8px 6px; }
  td { padding: 12px 6px; border-bottom: 1px solid #f0ece2; vertical-align: top; }
  .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  tfoot td { border: none; padding: 5px 6px; }
  tfoot .total td { border-top: 2px solid #080908; font-size: 16px; font-weight: 600; padding-top: 12px; }
  .accent { color: #c9a227; }
  footer { margin-top: 32px; border-top: 1px solid #e4dfd3; padding-top: 16px; font-size: 11px; color: #6e7268; }
  .actions { max-width: 800px; margin: 0 auto 16px; display: flex; justify-content: flex-end; }
  button { font: inherit; padding: 8px 18px; border: 1px solid #080908; background: #080908; color: #f4f0e7; cursor: pointer; letter-spacing: .08em; text-transform: uppercase; font-size: 11px; }
  @media print { body { background: #fff; padding: 0; } .sheet { border: none; padding: 0; } .actions { display: none; } }
</style>
</head>
<body>
  <div class="actions"><button onclick="window.print()">Print / save as PDF</button></div>
  <div class="sheet">
    <header>
      <div>
        <div class="brand">${escapeHtml(db.store.logoText)}</div>
        <div class="muted">${escapeHtml(db.store.tagline)}</div>
        <div class="muted" style="margin-top:10px">
          ${escapeHtml(db.store.supportEmail)}<br />
          ${escapeHtml(db.store.supportPhone)}<br />
          GSTIN 29ABCDE1234F1Z5
        </div>
      </div>
      <div style="text-align:right">
        <h1>Tax invoice</h1>
        <div class="muted">
          Invoice ${escapeHtml(order.orderNumber)}<br />
          Date ${formatDate(order.createdAt)}<br />
          Payment ${order.paymentMethod.toUpperCase()} · ${escapeHtml(order.paymentReference)}
        </div>
      </div>
    </header>

    <div class="grid">
      <div>
        <h1>Billed to</h1>
        <div>${escapeHtml(order.customerName)}</div>
        <div class="muted">
          ${escapeHtml(order.billingAddress.line1)}${order.billingAddress.line2 ? `, ${escapeHtml(order.billingAddress.line2)}` : ""}<br />
          ${escapeHtml(order.billingAddress.city)}, ${escapeHtml(order.billingAddress.state)} ${escapeHtml(order.billingAddress.postalCode)}<br />
          ${escapeHtml(order.customerPhone)} · ${escapeHtml(order.customerEmail)}
        </div>
      </div>
      <div>
        <h1>Shipped to</h1>
        <div>${escapeHtml(order.shippingAddress.firstName)} ${escapeHtml(order.shippingAddress.lastName)}</div>
        <div class="muted">
          ${escapeHtml(order.shippingAddress.line1)}${order.shippingAddress.line2 ? `, ${escapeHtml(order.shippingAddress.line2)}` : ""}<br />
          ${escapeHtml(order.shippingAddress.city)}, ${escapeHtml(order.shippingAddress.state)} ${escapeHtml(order.shippingAddress.postalCode)}<br />
          ${escapeHtml(order.shippingMethod)}
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th class="num">GST</th>
          <th class="num">Qty</th>
          <th class="num">Rate</th>
          <th class="num">Amount</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr><td colspan="4" class="num muted">Subtotal</td><td class="num">${money(order.subtotal)}</td></tr>
        ${order.discount > 0 ? `<tr><td colspan="4" class="num muted">Discount${order.couponCode ? ` (${escapeHtml(order.couponCode)})` : ""}</td><td class="num">− ${money(order.discount)}</td></tr>` : ""}
        <tr><td colspan="4" class="num muted">Delivery</td><td class="num">${order.shipping === 0 ? "Free" : money(order.shipping)}</td></tr>
        ${
          intraState
            ? `<tr><td colspan="4" class="num muted">CGST 9% (included)</td><td class="num">${money(half)}</td></tr>
               <tr><td colspan="4" class="num muted">SGST 9% (included)</td><td class="num">${money(order.tax - half)}</td></tr>`
            : `<tr><td colspan="4" class="num muted">IGST 18% (included)</td><td class="num">${money(order.tax)}</td></tr>`
        }
        <tr class="total"><td colspan="4" class="num">Total</td><td class="num">${money(order.total)}</td></tr>
      </tfoot>
    </table>

    <footer>
      This is a computer-generated invoice and does not require a signature. Prices are inclusive of GST.
      Returns accepted within 30 days of delivery under our published returns policy.
      <span class="accent">${escapeHtml(db.store.name)}</span> · ${escapeHtml(db.store.domain)}
    </footer>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
