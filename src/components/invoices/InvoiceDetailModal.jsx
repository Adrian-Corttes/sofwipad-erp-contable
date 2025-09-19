import React from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";

const InvoiceDetailModal = ({
  isOpen,
  onClose,
  invoice,
  entityName = "Cliente",
  onDownloadPDF,
}) => {
  if (!isOpen || !invoice) return null;

  const handleDownloadPDF = () => {
    if (typeof onDownloadPDF === "function") {
      onDownloadPDF(invoice);
    } else {
      console.warn("InvoiceDetailModal: onDownloadPDF no está definido.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalle de Factura">
      <div className="space-y-3 text-sm">
        <p>
          <b>Número:</b> {invoice.invoiceNumber}
        </p>
        <p>
          <b>Fecha:</b>{" "}
          {invoice.date?.seconds
            ? new Date(invoice.date.seconds * 1000).toLocaleDateString("es-CO", {
        timeZone: "America/Bogota",
      })
            : "N/A"}
        </p>
        <p>
          <b>{entityName}:</b>{" "}
          {entityName === "Cliente"
            ? invoice.clientName || invoice.clientId
            : invoice.supplierName || invoice.supplierId}
        </p>
        {invoice.vendedor && (
          <p>
            <b>Vendedor:</b> {invoice.vendedor}
          </p>
        )}

        <table className="w-full border text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th>Producto</th>
              <th>Cant.</th>
              <th>Precio</th>
              <th>Desc.</th>
              <th>IVA</th>
              <th>Ret.</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => {
              const qty = item.quantity;
              const base = item.price * qty * (1 - (item.discount || 0) / 100);
              const iva = base * ((item.tax || 0) / 100);
              const ret = base * ((item.retention || 0) / 100);
              const total = base + iva - ret;
              return (
                <tr key={i}>
                  <td>{item.name}</td>
                  <td>{qty}</td>
                  <td>${item.price}</td>
                  <td>{item.discount ?? 0}%</td>
                  <td>{item.tax ?? 0}%</td>
                  <td>{item.retention ?? 0}%</td>
                  <td>${total.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="text-right space-y-1">
          <p>Subtotal: ${invoice.subtotal?.toFixed(2)}</p>
          <p>IVA: ${invoice.iva?.toFixed(2)}</p>
          <p>Retenciones: -${invoice.retenciones?.toFixed(2)}</p>
          <p className="text-lg font-bold">
            Total Neto: ${invoice.total?.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={handleDownloadPDF}>
          Descargar PDF
        </Button>
      </div>
    </Modal>
  );
};

export default InvoiceDetailModal;
