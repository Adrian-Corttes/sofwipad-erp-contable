import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { db, collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, increment, getDoc, setDoc } from "../../lib/firebase";
import { icons } from "../../components/ui/icons";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";

const Products = () => {
  const { companyData } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    type: "producto",
    code: "",
    description: "",
    unit: "unidades",
    unitValue: 0,
    taxed: true,
    iva: 19,
    createdAt: null,
  });

  const units = ["unidades", "centímetros", "metros", "kilogramos", "litros"];

  useEffect(() => {
    if (!companyData) return;
    const q = query(collection(db, `companies/${companyData.id}/products`));
    const unsub = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [companyData]);

  const filteredItems = items.filter((r) => {
    const term = search.toLowerCase();
    return (
      r.code?.toLowerCase().includes(term) ||
      r.description?.toLowerCase().includes(term) ||
      r.name?.toLowerCase().includes(term)
    );
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({
      type: "producto",
      code: "",
      description: "",
      unit: "unidades",
      unitValue: 0,
      taxed: true,
      iva: 19,
      createdAt: null,
    });
    setIsModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      type: row.type || "producto",
      code: row.code || "",
      description: row.description || "",
      unit: row.unit || "unidades",
      unitValue: row.unitValue ?? 0,
      taxed: row.taxed ?? true,
      iva: row.iva ?? "",
      createdAt: row.createdAt || null,
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!companyData) return;

    try {
      let productCode = form.code;

      if (!editingId) {
        const typeKey = form.type === "producto" ? "products" : "services";
        const counterRef = doc(
          db,
          `companies/${companyData.id}/counters/${typeKey}`
        );
        await setDoc(counterRef, { lastCode: increment(1) }, { merge: true });

        const counterSnap = await getDoc(counterRef);
        const nextNumber = counterSnap.exists()
          ? counterSnap.data().lastCode
          : 1;

        const prefix = form.type === "producto" ? "P" : "S";
        productCode = `${prefix}-${String(nextNumber).padStart(3, "0")}`;
      }

      const payload = {
        type: form.type,
        code: productCode,
        description: String(form.description).trim(),
        name: String(form.description).trim(),
        unit: form.unit,
        unitValue: Number(form.unitValue) || 0,
        taxed: Boolean(form.taxed),
        iva: form.taxed ? (form.iva === "" ? null : Number(form.iva)) : 0,
        createdAt: editingId ? form.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(
          doc(db, `companies/${companyData.id}/products/${editingId}`),
          payload
        );
      } else {
        await addDoc(
          collection(db, `companies/${companyData.id}/products`),
          payload
        );
      }

      setIsModalOpen(false);
      setEditingId(null);
    } catch (err) {
      console.error("Error guardando producto/servicio", err);
      alert("⚠️ Error guardando producto/servicio: " + err.message);
    }
  };

  const handleDelete = async (row) => {
    if (!companyData) return;
    if (
      !confirm(
        `¿Eliminar "${row.description}"? Esta acción no se puede deshacer.`
      )
    )
      return;
    try {
      await deleteDoc(
        doc(db, `companies/${companyData.id}/products/${row.id}`)
      );
    } catch (err) {
      console.error("Error eliminando producto/servicio", err);
      alert("⚠️ Error eliminando: " + err.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Buscar por código o descripción"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-lg text-sm w-80"
        />
        <Button onClick={openCreate}>
          {icons.plus} Nuevo Producto/Servicio
        </Button>
      </div>

      <Card title="Productos y Servicios">
        {loading ? (
          <Spinner />
        ) : (
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Código</th>
                <th className="px-6 py-3">Descripción</th>
                <th className="px-6 py-3">Unidad</th>
                <th className="px-6 py-3">Valor Unitario</th>
                <th className="px-6 py-3">Gravado IVA</th>
                <th className="px-6 py-3">IVA</th>
                <th className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((r) => (
                <tr key={r.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-3 capitalize">{r.type}</td>
                  <td className="px-6 py-3">{r.code}</td>
                  <td className="px-6 py-3">{r.description}</td>
                  <td className="px-6 py-3">{r.unit}</td>
                  <td className="px-6 py-3 text-right">
                    ${new Intl.NumberFormat("es-CO").format(r.unitValue || 0)}
                  </td>
                  <td className="px-6 py-3">{r.taxed ? "Sí" : "No"}</td>
                  <td className="px-6 py-3">
                    {r.iva === null || r.iva === ""
                      ? "No especificado"
                      : `${r.iva}%`}
                  </td>
                  <td className="px-6 py-3 flex space-x-2">
                    <button
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={() => openEdit(r)}
                    >
                      {icons.edit}
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDelete(r)}
                    >
                      {icons.trash}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-500">
                    No se encontraron resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingId ? "Editar" : "Crear"} Producto/Servicio`}
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Tipo</h3>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="type"
                  value="producto"
                  checked={form.type === "producto"}
                  onChange={handleChange}
                />
                <span>Producto</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="type"
                  value="servicio"
                  checked={form.type === "servicio"}
                  onChange={handleChange}
                />
                <span>Servicio</span>
              </label>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Información del {form.type}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="description"
                name="description"
                label="Descripción"
                value={form.description}
                onChange={handleChange}
                required
              />
              <Select
                id="unit"
                name="unit"
                label="Unidad de medida"
                value={form.unit}
                onChange={handleChange}
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
              <Input
                id="unitValue"
                name="unitValue"
                type="number"
                label="Valor unitario"
                value={form.unitValue}
                onChange={handleChange}
                min="0"
                step="0.01"
              />

              {editingId && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha de creación
                  </label>
                  <input
                    type="text"
                    value={
                      form.createdAt
                        ? new Date(
                            form.createdAt.seconds * 1000
                          ).toLocaleDateString("es-CO")
                        : ""
                    }
                    readOnly
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Impuestos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="taxed"
                  checked={form.taxed}
                  onChange={handleChange}
                />
                <span>Gravado con IVA</span>
              </div>
              <Select
                id="iva"
                name="iva"
                label="IVA"
                value={form.iva}
                onChange={handleChange}
                disabled={!form.taxed}
              >
                <option value="">No especificado</option>
                <option value={0}>0%</option>
                <option value={5}>5%</option>
                <option value={19}>19%</option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
