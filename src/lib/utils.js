
import jsPDF from "jspdf";
import "jspdf-autotable";

export const generateInvoicePDF = (
  invoice,
  title = "Factura",
  entityName = "Cliente"
) => {
  const doc = new jsPDF();

  // Encabezado
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  doc.text(`Número: ${invoice.invoiceNumber || "SINID"}`, 14, 28);

  if (entityName === "Cliente") {
    doc.text(
      `Cliente: ${invoice.clientName || invoice.clientId || "N/A"}`,
      14,
      34
    );
  } else {
    doc.text(
      `Proveedor: ${invoice.supplierName || invoice.supplierId || "N/A"}`,
      14,
      34
    );
  }

  // Items de la factura
  const rows = (invoice.items || []).map((item) => [
    item.name || "—",
    item.quantity || 0,
    `$${item.price || 0}`,
    `${item.discount ?? 0}%`,
    `${item.tax ?? 0}%`,
    `${item.retention ?? 0}%`,
    `$${((item.price || 0) * (item.quantity || 0)).toFixed(2)}`,
  ]);

  if (rows.length > 0) {
    doc.autoTable({
      head: [["Producto", "Cant.", "Precio", "Desc.", "IVA", "Ret.", "Total"]],
      body: rows,
      startY: 40,
    });
  }

  // Posición final después de la tabla
  const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) || 40;

  // Totales
  doc.text(`Subtotal: $${invoice.subtotal || 0}`, 14, finalY + 10);
  doc.text(`IVA: $${invoice.iva || 0}`, 14, finalY + 16);
  doc.text(`Retenciones: -$${invoice.retenciones || 0}`, 14, finalY + 22);
  doc.setFontSize(12);
  doc.text(`Total Neto: $${invoice.total || 0}`, 14, finalY + 32);

  // Guardar archivo
  doc.save(`${title}_${invoice.invoiceNumber || "SINID"}.pdf`);
};
