import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useApp } from "../../context/AppContext";
import { db, collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, increment, getDoc, setDoc, serverTimestamp, orderBy, limit } from "../../lib/firebase";
import { generateInvoicePDF } from "../../lib/utils";
import { icons } from "../../components/ui/icons";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";
import InvoiceFormModal from "./InvoiceFormModal";
import InvoiceDetailModal from "../../components/invoices/InvoiceDetailModal";

const Sales = ({ setActiveView }) => {
  const { companyData } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [retenciones, setRetenciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastInvoiceNumber, setLastInvoiceNumber] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const formatInvoiceDate = (d) => {
    if (!d) return "N/A";
    if (d.seconds)
      return new Date(d.seconds * 1000).toLocaleDateString("es-CO", {
        timeZone: "America/Bogota",
      });
    if (typeof d.toDate === "function")
      return d.toDate().toLocaleDateString("es-CO", {
        timeZone: "America/Bogota",
      });
    if (d instanceof Date)
      return d.toLocaleDateString("es-CO", { timeZone: "America/Bogota" });
    if (typeof d === "string") return d;
    return String(d);
  };

  useEffect(() => {
    if (!companyData) return;
    setLoading(true);
    const q = query(collection(db, `companies/${companyData.id}/invoices_sales`));
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
        console.error("Error fetching invoices: ", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [companyData]);

  useEffect(() => {
    if (!companyData) return;
    const clientsQuery = query(collection(db, `companies/${companyData.id}/thirdparties`));
    const productsQuery = query(collection(db, `companies/${companyData.id}/products`));
    const retencionesQuery = query(collection(db, `companies/${companyData.id}/retenciones`));

    const unsubClients = onSnapshot(clientsQuery, (snapshot) => {
      setClients(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    const unsubProducts = onSnapshot(productsQuery, (snapshot) => {
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    const unsubRetenciones = onSnapshot(retencionesQuery, (snapshot) => {
      setRetenciones(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubClients();
      unsubProducts();
      unsubRetenciones();
    };
  }, [companyData]);

  useEffect(() => {
    if (!companyData) return;
    const q = query(
      collection(db, `companies/${companyData.id}/invoices_sales`),
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
    const toastId = toast.loading("Creando factura...");
    try {
      const counterRef = doc(db, `companies/${companyData.id}/counters/invoices_sales`);
      await setDoc(counterRef, { lastNumber: increment(1) }, { merge: true });

      const counterSnap = await getDoc(counterRef);
      const nextNumber = counterSnap.exists() ? counterSnap.data().lastNumber : 1;
      const invoiceNumber = `FV-${String(nextNumber).padStart(3, "0")}`;

      let dateToSave = null;
      if (invoiceData?.date) {
        if (typeof invoiceData.date === "string") {
          const [y, m, d] = invoiceData.date.split("-");
          dateToSave = new Date(Number(y), Number(m) - 1, Number(d));
        } else if (invoiceData instanceof Date) {
          dateToSave = new Date(
            invoiceData.getFullYear(),
            invoiceData.getMonth(),
            invoiceData.getDate()
          );
        } else if (invoiceData.date.seconds) {
          dateToSave = new Date(invoiceData.date.seconds * 1000);
        }
      }

      const invoicesRef = collection(db, `companies/${companyData.id}/invoices_sales`);
      const newInvoiceRef = await addDoc(invoicesRef, {
        ...invoiceData,
        date: dateToSave || new Date(),
        companyId: companyData.id,
        invoiceNumber,
        createdAt: serverTimestamp(),
        status: "Pendiente",
      });

      await updateDoc(newInvoiceRef, { id: newInvoiceRef.id });

      setIsModalOpen(false);
      toast.success("✅ Factura creada con éxito", { id: toastId });
    } catch (error) {
      console.error("Error creating invoice: ", error);
      toast.error("❌ Error al crear la factura", { id: toastId });
    }
  };

  const handleUpdateInvoice = async (invoiceData) => {
    if (!companyData || !editingInvoice) return;
    const toastId = toast.loading("Actualizando factura...");
    try {
      const invoiceRef = doc(
        db,
        `companies/${companyData.id}/invoices_sales/${editingInvoice.id}`
      );

      let dateToSave = undefined;
      if (invoiceData?.date) {
        if (typeof invoiceData.date === "string") {
          const [y, m, d] = invoiceData.date.split("-");
          dateToSave = new Date(Number(y), Number(m) - 1, Number(d));
        } else if (invoiceData instanceof Date) {
          dateToSave = new Date(
            invoiceData.getFullYear(),
            invoiceData.getMonth(),
            invoiceData.getDate()
          );
        } else if (invoiceData.date.seconds) {
          dateToSave = new Date(invoiceData.date.seconds * 1000);
        }
      }

      const payload = {
        ...invoiceData,
        updatedAt: serverTimestamp(),
      };
      if (dateToSave) payload.date = dateToSave;

      await updateDoc(invoiceRef, payload);

      setEditingInvoice(null);
      setIsModalOpen(false);
      toast.success("✅ Factura actualizada correctamente", { id: toastId });
    } catch (error) {
      console.error("Error updating invoice: ", error);
      toast.error("❌ Error al actualizar la factura", { id: toastId });
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!companyData) return;
    if (!window.confirm("¿Seguro que deseas eliminar esta factura?")) return;
    const toastId = toast.loading("Eliminando factura...");
    try {
      const path = `companies/${companyData.id}/invoices_sales/${id}`;
      await deleteDoc(doc(db, path));
      toast.success("✅ Factura eliminada correctamente", { id: toastId });
    } catch (error) {
      console.error("❌ Error deleting invoice: ", error);
      toast.error("❌ Error eliminando factura", { id: toastId });
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const client = clients.find((c) => c.id === invoice.clientId);
    const idNumber = client?.idNumber?.toLowerCase() || "";
    const clientName = client?.name?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();

    return idNumber.includes(term) || clientName.includes(term);
  });

  return (
    <div>
      <div className="border-b mb-4">
        <nav className="flex space-x-6 text-sm font-medium text-gray-600">
          <button className="border-b-2 border-blue-600 text-blue-600 pb-2">
            Documentos de venta
          </button>
          <button className="pb-2 hover:text-blue-600">Facturas recurrentes</button>
          <button className="pb-2 hover:text-blue-600">Clientes</button>
          <button className="pb-2 hover:text-blue-600">Seguimiento comercial</button>
        </nav>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Buscar por Identificación o Cliente"
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
            {icons.userPlus} Crear Cliente
          </Button>
          <Button
            onClick={() => {
              setEditingInvoice(null);
              setIsModalOpen(true);
            }}
          >
            {icons.plus} Crear Factura
          </Button>
        </div>
      </div>

      <Card title="Facturas de Venta">
        {loading ? (
          <Spinner />
        ) : (
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Comprobante</th>
                <th className="px-6 py-3">Identificación</th>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Moneda</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{formatInvoiceDate(invoice.date)}</td>
                  <td className="px-6 py-4 font-medium text-blue-600">
                    {invoice.invoiceNumber || "FV-SINID"}
                  </td>
                  <td className="px-6 py-4">
                    {clients.find((c) => c.id === invoice.clientId)?.idNumber || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    {clients.find((c) => c.id === invoice.clientId)?.name || "Consumidor Final"}
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

      <InvoiceFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInvoice(null);
        }}
        onSubmit={editingInvoice ? handleUpdateInvoice : handleCreateInvoice}
        clients={clients}
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
          entityName="Cliente"
          onDownloadPDF={(invoice) =>
            generateInvoicePDF(invoice, "Factura de Venta", "Cliente")
          }
        />
      )}
    </div>
  );
};

export default Sales;