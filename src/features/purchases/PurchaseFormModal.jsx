import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import { icons } from "../../components/ui/icons";

const PurchaseFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  suppliers,
  products,
  initialData,
  lastInvoiceNumber,
}) => {
  const { userData } = useApp();

  const [tipoFactura, setTipoFactura] = useState("FC-1-Compra");
  const [supplierId, setSupplierId] = useState("");
  const [date, setDate] = useState(() => {
    const today = new Date();
    return new Date(today.getTime() - today.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
  });
  const [supplierPrefix, setSupplierPrefix] = useState("FC");
  const [supplierConsecutive, setSupplierConsecutive] = useState("");
  const [items, setItems] = useState([
    {
      productId: "",
      code: "",
      name: "",
      quantity: 1,
      price: 0,
      discount: 0,
      tax: "",
      retention: "",
    },
  ]);
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [observaciones, setObservaciones] = useState("");

  const [subtotal, setSubtotal] = useState(0);
  const [iva, setIva] = useState(0);
  const [retenciones, setRetenciones] = useState(0);
  const [totalNeto, setTotalNeto] = useState(0);

  const retencionesOptions = [
    { label: " ", value: "" },
    { label: "Retefuente 20%", value: 20 },
    { label: "Retefuente 11%", value: 11 },
    { label: "Retefuente 10%", value: 10 },
    { label: "Retefuente 7%", value: 7 },
    { label: "Retefuente 6%", value: 6 },
    { label: "Retefuente 4%", value: 4 },
    { label: "Retefuente 3.5%", value: 3.5 },
    { label: "Retefuente 2.5%", value: 2.5 },
    { label: "Retefuente 2%", value: 2 },
    { label: "Retefuente 1.5%", value: 1.5 },
    { label: "Retefuente 1%", value: 1 },
    { label: "Retefuente 0.50%", value: 0.5 },
    { label: "Retefuente 0.10%", value: 0.1 },
  ];

  const getNextInvoiceNumber = (lastInvoiceNumber) => {
    if (!lastInvoiceNumber) return "FC-001";
    const match = lastInvoiceNumber.match(/^FC-(\d+)$/);
    if (!match) return null;
    const num = parseInt(match[1], 10) + 1;
    return `FC-${String(num).padStart(3, "0")}`;
  };

  useEffect(() => {
    if (initialData) {
      setTipoFactura(initialData.tipoFactura || "FC-1-Compra");
      setSupplierId(initialData.supplierId || "");
      setDate(
        initialData.date
          ? new Date(initialData.date.seconds * 1000)
              .toISOString()
              .split("T")[0]
          : date
      );
      if (initialData.supplierInvoice) {
        const parts = initialData.supplierInvoice.split("-");
        setSupplierPrefix(parts[0] || "FC");
        setSupplierConsecutive(parts[1] || "");
      }
      setItems(initialData.items || []);
      setPaymentMethod(initialData.paymentMethod || "Efectivo");
      setObservaciones(initialData.observaciones || "");
    }
  }, [initialData, date]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === "productId") {
      if (value === "") {
        newItems[index] = {
          productId: "",
          code: "",
          name: "",
          quantity: 1,
          price: 0,
          discount: 0,
          tax: "",
          retention: "",
        };
      } else {
        const product = products.find((p) => p.id === value);
        if (product) {
          newItems[index].price = product.unitValue || 0;
          newItems[index].tax = product.iva ?? "";
          newItems[index].code = product.code || "";
          newItems[index].name = product.name || product.description || "";
        }
      }
    }

    setItems(newItems);
  };

  const addItem = () =>
    setItems([
      ...items,
      {
        productId: "",
        code: "",
        name: "",
        quantity: 1,
        price: 0,
        discount: 0,
        tax: "",
        retention: "",
      },
    ]);

  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  useEffect(() => {
    let sub = 0;
    let ivaCalc = 0;
    let retCalc = 0;

    items.forEach((item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const desc = (Number(item.discount) || 0) / 100;
      const base = qty * price * (1 - desc);

      const taxRate = item.tax === "" ? 0 : Number(item.tax) / 100;
      const retRate = item.retention === "" ? 0 : Number(item.retention) / 100;

      sub += base;
      ivaCalc += base * taxRate;
      retCalc += base * retRate;
    });

    setSubtotal(sub);
    setIva(ivaCalc);
    setRetenciones(retCalc);
    setTotalNeto(sub + ivaCalc - retCalc);
  }, [items]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newInvoiceNumber = !initialData
      ? getNextInvoiceNumber(lastInvoiceNumber)
      : initialData.invoiceNumber;

    const invoiceData = {
      id: initialData?.id || null,
      tipoFactura,
      supplierId,
      supplierInvoice: `${supplierPrefix}-${supplierConsecutive}`,
      comprador: userData?.name || "Usuario",
      date,
      items: items.map((i) => ({
        ...i,
        quantity: Number(i.quantity),
        price: Number(i.price),
        discount: Number(i.discount),
        tax: i.tax === "" ? null : Number(i.tax),
        retention: i.retention === "" ? null : Number(i.retention),
      })),
      paymentMethod,
      observaciones,
      subtotal,
      iva,
      retenciones,
      total: totalNeto,
      invoiceNumber: newInvoiceNumber,
    };

    onSubmit(invoiceData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        initialData ? "Editar Factura de Compra" : "Nueva Factura de Compra"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!initialData && (
          <div className="p-2 bg-gray-100 rounded text-sm text-gray-700 space-y-1">
            {lastInvoiceNumber ? (
              <>
                <p>
                  Última factura registrada: <b>{lastInvoiceNumber}</b>
                </p>
                {getNextInvoiceNumber(lastInvoiceNumber) && (
                  <p>
                    Siguiente sugerida:{" "}
                    <b>{getNextInvoiceNumber(lastInvoiceNumber)}</b>
                  </p>
                )}
              </>
            ) : (
              <p>No hay facturas registradas aún. Sugerida: <b>FC-001</b></p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Tipo de Factura"
            value={tipoFactura}
            onChange={(e) => setTipoFactura(e.target.value)}
            required
          >
            <option value="FC-1-Compra">FC-1-Compra</option>
          </Select>

          <Select
            label="Proveedor"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            required
          >
            <option value="">Seleccione un proveedor</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} - {s.idNumber}
              </option>
            ))}
          </Select>

          <Input
            label="Fecha de Elaboración"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <div className="flex items-end space-x-2">
            <Input
              label="Nº Factura Proveedor (Prefijo)"
              value={supplierPrefix}
              onChange={(e) => setSupplierPrefix(e.target.value)}
            />
            <Input
              label="Consecutivo"
              value={supplierConsecutive}
              onChange={(e) => setSupplierConsecutive(e.target.value)}
            />
          </div>

          <Input label="Comprador" value={userData?.name || ""} readOnly />
        </div>

        <h4 className="text-md font-semibold pt-4 border-t">
          Ítems de la Compra
        </h4>
        <div className="grid grid-cols-14 gap-2 font-semibold text-gray-600 text-sm border-b pb-1">
          <div className="col-span-3">Producto</div>
          <div className="col-span-2">Cantidad</div>
          <div className="col-span-2">Valor Unitario</div>
          <div className="col-span-2">% Desc.</div>
          <div className="col-span-2">Impuesto</div>
          <div className="col-span-1">% Ret.</div>
          <div className="col-span-1">Valor Total</div>
          <div className="w-8 flex justify-center"></div>
        </div>

        {items.map((item, index) => {
          const qty = Number(item.quantity) || 0;
          const price = Number(item.price) || 0;
          const desc = (Number(item.discount) || 0) / 100;
          const base = qty * price * (1 - desc);
          const taxRate = item.tax === "" ? 0 : Number(item.tax) / 100;
          const retRate =
            item.retention === "" ? 0 : Number(item.retention) / 100;
          const totalItem = base + base * taxRate - base * retRate;

          return (
            <div key={index} className="grid grid-cols-14 gap-2 items-center">
              <div className="col-span-3">
                <Select
                  value={item.productId}
                  onChange={(e) =>
                    handleItemChange(index, "productId", e.target.value)
                  }
                >
                  <option value="">Seleccione producto</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  value={item.quantity}
                  min="1"
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    handleItemChange(index, "price", e.target.value)
                  }
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  value={item.discount}
                  onChange={(e) =>
                    handleItemChange(index, "discount", e.target.value)
                  }
                />
              </div>
              <div className="col-span-2">
                <Select
                  value={item.tax}
                  onChange={(e) =>
                    handleItemChange(index, "tax", e.target.value)
                  }
                >
                  <option value=""> </option>
                  <option value={0}>0% (Exento)</option>
                  <option value={5}>5%</option>
                  <option value={19}>19%</option>
                </Select>
              </div>
              <div className="col-span-1">
                <Select
                  value={item.retention}
                  onChange={(e) =>
                    handleItemChange(index, "retention", e.target.value)
                  }
                >
                  {retencionesOptions.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="col-span-1 text-right font-semibold">
                {new Intl.NumberFormat("es-CO").format(totalItem)}
              </div>
              <div className="w-8 flex justify-center items-center">
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700 p-1"
                  onClick={() => removeItem(index)}
                >
                  {icons.trash}
                </button>
              </div>
            </div>
          );
        })}

        <Button type="button" variant="secondary" onClick={addItem}>
          Añadir Ítem
        </Button>

        <div className="mt-4 border-t pt-4 space-y-2 text-right">
          <p>
            Subtotal: <b>${new Intl.NumberFormat("es-CO").format(subtotal)}</b>
          </p>
          <p>
            IVA: <b>${new Intl.NumberFormat("es-CO").format(iva)}</b>
          </p>
          <p>
            Retenciones:{" "}
            <b>-${new Intl.NumberFormat("es-CO").format(retenciones)}</b>
          </p>
          <p className="text-lg font-bold">
            Total Neto: ${new Intl.NumberFormat("es-CO").format(totalNeto)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t pt-4">
          <Select
            label="Forma de Pago"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Crédito">Crédito</option>
          </Select>
          <Input
            label="Observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {initialData ? "Actualizar Factura" : "Guardar Factura"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PurchaseFormModal;
