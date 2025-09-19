import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useApp } from "../../context/AppContext";
import { db, collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc, increment, getDoc, serverTimestamp, orderBy, limit } from "../../lib/firebase";
import { generateInvoicePDF } from "../../lib/utils";
import { icons } from "../../components/ui/icons";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";
import PurchaseFormModal from "./PurchaseFormModal";
import InvoiceDetailModal from "../../components/invoices/InvoiceDetailModal";

const Purchases = ({ setActiveView }) => {
  const { companyData } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [retenciones, setRetenciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastInvoiceNumber, setLastInvoiceNumber] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const formatInvoiceDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("es-CO", {
      timeZone: "America/Bogota",
    });
  };

  const normalizeDate = (dateInput) => {
    if (!dateInput) return null;

    if (typeof dateInput === "string") {
      const [y, m, d] = dateInput.split("-");
      return new Date(Number(y), Number(m) - 1, Number(d));
    }

    if (dateInput instanceof Date) {
      return new Date(
        dateInput.getFullYear(),
        dateInput.getMonth(),
        dateInput.getDate()
      );
    }

    if (dateInput?.seconds) {
      return new Date(dateInput.seconds * 1000);
    }

    return null;
  };

  useEffect(() => {
    if (!companyData) return;
    setLoading(true);
    const q = query(
      collection(db, `companies/${companyData.id}/invoices_purchases`)
    );
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const invoicesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInvoices(invoicesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching purchase invoices: ", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [companyData]);

  useEffect(() => {
    if (!companyData) return;
    const suppliersQuery = query(
      collection(db, `companies/${companyData.id}/thirdparties`)
    );
    const productsQuery = query(
      collection(db, `companies/${companyData.id}/products`)
    );
    const retencionesQuery = query(
      collection(db, `companies/${companyData.id}/retenciones`)
    );

    const unsubSuppliers = onSnapshot(suppliersQuery, (snapshot) => {
      const allThirdparties = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const onlySuppliers = allThirdparties.filter(
        (t) =>
          (Array.isArray(t.type) && t.type.includes("proveedor")) ||
          t.type === "proveedor" ||
          t.type === "Proveedor"
      );
      setSuppliers(onlySuppliers);
    });

    const unsubProducts = onSnapshot(productsQuery, (snapshot) => {
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubRetenciones = onSnapshot(retencionesQuery, (snapshot) => {
      setRetenciones(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubSuppliers();
      unsubProducts();
      unsubRetenciones();
    };
  }, [companyData]);

  useEffect(() => {
    if (!companyData) return;
    const q = query(
      collection(db, `companies/${companyData.id}/invoices_purchases`),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const lastInvoice = snapshot.docs[0].data();
        setLastInvoiceNumber(lastInvoice.invoiceNumber);
      } else {
        setLastInvoiceNumber(null);
      }
    });

    return () => unsubscribe();
  }, [companyData]);

  const handleCreateInvoice = async (invoiceData) => {
    if (!companyData) return;
    const toastId = toast.loading("Creando factura de compra...");
    try {
      const counterRef = doc(
        db,
        `companies/${companyData.id}/counters/invoices_purchases`
      );
      await setDoc(counterRef, { lastNumber: increment(1) }, { merge: true });

      const counterSnap = await getDoc(counterRef);
      const nextNumber = counterSnap.exists()
        ? counterSnap.data().lastNumber
        : 1;
      const invoiceNumber = `FC-${String(nextNumber).padStart(3, "0")}`;

      const invoicesRef = collection(
        db,
        `companies/${companyData.id}/invoices_purchases`
      );
      const newInvoiceRef = await addDoc(invoicesRef, {
        ...invoiceData,
        date: normalizeDate(invoiceData.date),
        companyId: companyData.id,
        invoiceNumber,
        createdAt: serverTimestamp(),
        status: "Pendiente",
      });

      await updateDoc(newInvoiceRef, { id: newInvoiceRef.id });

      setIsModalOpen(false);
      toast.success("✅ Factura de compra creada con éxito", { id: toastId });
    } catch (error) {
      console.error("Error creating purchase invoice: ", error);
      toast.error("❌ Error al crear la factura de compra", { id: toastId });
    }
  };

  const handleUpdateInvoice = async (invoiceData) => {
    if (!companyData || !editingInvoice) return;
    const toastId = toast.loading("Actualizando factura de compra...");
    try {
      const invoiceRef = doc(
        db,
        `companies/${companyData.id}/invoices_purchases/${editingInvoice.id}`
      );
      await updateDoc(invoiceRef, {
        ...invoiceData,
        date: normalizeDate(invoiceData.date),
        updatedAt: serverTimestamp(),
      });
      setEditingInvoice(null);
      setIsModalOpen(false);
      toast.success("✅ Factura de compra actualizada correctamente", {
        id: toastId,
      });
    } catch (error) {
      console.error("Error updating purchase invoice: ", error);
      toast.error("❌ Error al actualizar la factura de compra", {
        id: toastId,
      });
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!companyData) return;
    if (!window.confirm("¿Seguro que deseas eliminar esta factura de compra?"))
      return;
    const toastId = toast.loading("Eliminando factura de compra...");
    try {
      const path = `companies/${companyData.id}/invoices_purchases/${id}`;
      await deleteDoc(doc(db, path));
      toast.success("✅ Factura eliminada correctamente", { id: toastId });
    } catch (error) {
      console.error("❌ Error deleting purchase invoice: ", error);
      toast.error("❌ Error eliminando factura", { id: toastId });
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const supplier = suppliers.find((s) => s.id === invoice.supplierId);
    const idNumber = supplier?.idNumber?.toLowerCase() || "";
    const supplierName = supplier?.name?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();

    return idNumber.includes(term) || supplierName.includes(term);
  });

  return (
    <div>
      <div className="border-b mb-4">
        <nav className="flex space-x-6 text-sm font-medium text-gray-600">
          <button className="border-b-2 border-blue-600 text-blue-600 pb-2">
            Documentos de compra
          </button>
          <button className="pb-2 hover:text-blue-600">Proveedores</button>
          <button className="pb-2 hover:text-blue-600">Órdenes de compra</button>
        </nav>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Buscar por Identificación o Proveedor"
            className="border px-3 py-2 rounded-lg text-sm w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setActiveView("thirdparties")}
          >
            {icons.userPlus} Crear Proveedor
          </Button>
          <Button
            onClick={() => {
              setEditingInvoice(null);
              setIsModalOpen(true);
            }}
          >
            {icons.plus} Nueva Factura de Compra
          </Button>
        </div>
      </div>

      <Card title="Facturas de Compra">
        {loading ? (
          <Spinner />
        ) : (
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Comprobante</th>
                <th className="px-6 py-3">Identificación</th>
                <th className="px-6 py-3">Proveedor</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Moneda</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="bg-white border-b hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    {invoice.date?.seconds
                      ? formatInvoiceDate(invoice.date)
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 font-medium text-blue-600">
                    {invoice.invoiceNumber || "FC-SINID"}
                  </td>
                  <td className="px-6 py-4">
                    {suppliers.find((s) => s.id === invoice.supplierId)
                      ?.idNumber || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    {suppliers.find((s) => s.id === invoice.supplierId)?.name ||
                      "Proveedor"}
                  </td>
                  <td className="px-6 py-4">
                    ${new Intl.NumberFormat("es-CO").format(invoice.total || 0)}
                  </td>
                  <td className="px-6 py-4">COP</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        invoice.status === "Pagada"
                          ? "bg-green-100 text-green-800"
                          : invoice.status === "Vencida"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {invoice.status || "Pendiente"}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setIsDetailOpen(true);
                      }}
                    >
                      {icons.eye}
                    </button>
                    <button
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={() => {
                        setEditingInvoice(invoice);
                        setIsModalOpen(true);
                      }}
                    >
                      {icons.edit}
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteInvoice(invoice.id)}
                    >
                      {icons.trash}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <PurchaseFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInvoice(null);
        }}
        onSubmit={editingInvoice ? handleUpdateInvoice : handleCreateInvoice}
        suppliers={suppliers}
        products={products}
        retenciones={retenciones}
        initialData={editingInvoice}
        lastInvoiceNumber={lastInvoiceNumber}
      />

      {isDetailOpen && selectedInvoice && (
        <InvoiceDetailModal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedInvoice(null);
          }}
          invoice={selectedInvoice}
          entityName="Proveedor"
          onDownloadPDF={(invoice) =>
            generateInvoicePDF(invoice, "Factura de Compra", "Proveedor")
          }
        />
      )}
    </div>
  );
};

export default Purchases;
