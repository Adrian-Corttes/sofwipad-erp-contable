import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { db, collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "../../lib/firebase";
import { icons } from "../../components/ui/icons";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import ErrorDisplay from "../../components/ui/ErrorDisplay";
import SuccessDisplay from "../../components/ui/SuccessDisplay";

const ThirdParties = () => {
  const { companyData } = useApp();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");

  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const [form, setForm] = useState({
    type: [],
    personType: "persona",
    idType: "CC",
    idNumber: "",
    name: "",
    lastName: "",
    tradeName: "",
    city: "",
    address: "",
    phone: "",
    email: "",
    otherDescription: "",
    createdAt: null,
  });

  const fullName = (r) =>
    r.personType === "empresa"
      ? r.tradeName || `${r.name}` || ""
      : `${r.name || ""} ${r.lastName || ""}`.trim();

  const idTypeLabel = (v) => (v === "NIT" ? "NIT" : "CC");

  useEffect(() => {
    if (!companyData) return;
    const q = query(collection(db, `companies/${companyData.id}/thirdparties`));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Error loading third parties:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [companyData]);

  const filtered = rows.filter((r) => {
    const t = search.toLowerCase();
    return (
      (r.idNumber || "").toLowerCase().includes(t) ||
      (r.name || "").toLowerCase().includes(t) ||
      (r.lastName || "").toLowerCase().includes(t) ||
      (r.tradeName || "").toLowerCase().includes(t) ||
      (r.email || "").toLowerCase().includes(t)
    );
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({
      type: [],
      personType: "persona",
      idType: "CC",
      idNumber: "",
      name: "",
      lastName: "",
      tradeName: "",
      city: "",
      address: "",
      phone: "",
      email: "",
      otherDescription: "",
      createdAt: null,
    });
    setIsModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      type: Array.isArray(row.type) ? row.type : [row.type].filter(Boolean),
      personType: row.personType || "persona",
      idType: row.idType || (row.personType === "empresa" ? "NIT" : "CC"),
      idNumber: row.idNumber || "",
      name: row.name || "",
      lastName: row.lastName || "",
      tradeName: row.tradeName || "",
      city: row.city || "",
      address: row.address || "",
      phone: row.phone || "",
      email: row.email || "",
      otherDescription: row.otherDescription || "",
      createdAt: row.createdAt || null,
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "personType") {
      setForm((p) => ({
        ...p,
        personType: value,
        idType: value === "empresa" ? "NIT" : "CC",
      }));
      return;
    }

    if (name === "type") {
      setForm((prev) => {
        let newTypes = [...prev.type];
        if (checked) {
          if (!newTypes.includes(value)) newTypes.push(value);
        } else {
          newTypes = newTypes.filter((t) => t !== value);
        }
        return { ...prev, type: newTypes };
      });
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!companyData) return;

    const payload = {
      type: form.type,
      personType: form.personType,
      idType: form.idType,
      idNumber: String(form.idNumber).trim(),
      name: String(form.name).trim(),
      lastName: String(form.lastName).trim(),
      tradeName: String(form.tradeName).trim(),
      city: String(form.city).trim(),
      address: String(form.address).trim(),
      phone: String(form.phone).trim(),
      email: String(form.email).trim(),
      otherDescription: form.type.includes("otro")
        ? String(form.otherDescription).trim()
        : "",
      createdAt: editingId ? form.createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingId) {
        await updateDoc(
          doc(db, `companies/${companyData.id}/thirdparties/${editingId}`),
          payload
        );
      } else {
        await addDoc(
          collection(db, `companies/${companyData.id}/thirdparties`),
          payload
        );
      }
      setIsModalOpen(false);
      setEditingId(null);
      setSuccessMessage(`Tercero ${editingId ? "actualizado" : "creado"} exitosamente.`);
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error("Error saving third party", err);
      setErrorMessage("⚠️ Error guardando tercero: " + err.message);
      setSuccessMessage(null);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleDelete = async (row) => {
    if (!companyData) return;
    if (
      !confirm(
        `¿Eliminar "${fullName(row)}"? Esta acción no se puede deshacer.`
      )
    )
      return;
    try {
      await deleteDoc(
        doc(db, `companies/${companyData.id}/thirdparties/${row.id}`)
      );
      setSuccessMessage(`Tercero "${fullName(row)}" eliminado exitosamente.`);
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error("Error deleting third party", err);
      setErrorMessage("⚠️ Error eliminando: " + err.message);
      setSuccessMessage(null);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  return (
    <div>
      <SuccessDisplay message={successMessage} />
      <ErrorDisplay message={errorMessage} />
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Buscar por identificación, nombre o correo"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-lg text-sm w-80"
        />
        <Button onClick={openCreate}>{icons.plus} Nuevo Tercero</Button>
      </div>

      <Card title="Terceros (Clientes, Proveedores y Otros)">
        {loading ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 bg-gray-50">Tipo</th>
                  <th className="px-6 py-3 bg-gray-50">Tipo Persona</th>
                  <th className="px-6 py-3 bg-gray-50">Identificación</th>
                  <th className="px-6 py-3 bg-gray-50">
                    Nombre / Razón social
                  </th>
                  <th className="px-6 py-3 bg-gray-50">Ciudad</th>
                  <th className="px-6 py-3 bg-gray-50">Teléfono</th>
                  <th className="px-6 py-3 bg-gray-50">Correo</th>
                  <th className="px-6 py-3 bg-gray-50">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-3 capitalize">
                      {Array.isArray(r.type) ? r.type.join(", ") : r.type || ""}
                    </td>
                    <td className="px-6 py-3 capitalize">{r.personType}</td>
                    <td className="px-6 py-3">
                      {idTypeLabel(r.idType)} {r.idNumber}
                    </td>
                    <td className="px-6 py-3">{fullName(r)}</td>
                    <td className="px-6 py-3">{r.city}</td>
                    <td className="px-6 py-3">{r.phone}</td>
                    <td className="px-6 py-3">{r.email}</td>
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
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-gray-500">
                      No se encontraron resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingId ? "Editar" : "Crear"} Tercero`}
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Tipo de tercero</h3>
            <div className="flex items-center space-x-6">
              {["cliente", "proveedor", "otro"].map((t) => (
                <label
                  key={t}
                  className="flex items-center space-x-2 capitalize"
                >
                  <input
                    type="checkbox"
                    name="type"
                    value={t}
                    checked={form.type.includes(t)}
                    onChange={handleChange}
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>

            {form.type.includes("otro") && (
              <div className="mt-3">
                <Input
                  id="otherDescription"
                  name="otherDescription"
                  label="Descripción (Otro)"
                  value={form.otherDescription}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              id="personType"
              name="personType"
              label="Tipo de Persona"
              value={form.personType}
              onChange={handleChange}
            >
              <option value="persona">Persona</option>
              <option value="empresa">Empresa</option>
            </Select>

            <Select
              id="idType"
              name="idType"
              label="Tipo de Identificación"
              value={form.idType}
              onChange={handleChange}
            >
              {form.personType === "empresa" ? (
                <option value="NIT">NIT</option>
              ) : (
                <option value="CC">Cédula de Ciudadanía (CC)</option>
              )}
            </Select>

            <Input
              id="idNumber"
              name="idNumber"
              label={
                form.personType === "empresa"
                  ? "Número de NIT"
                  : "Número de Cédula"
              }
              value={form.idNumber}
              onChange={handleChange}
              required
            />
            <Input
              id="name"
              name="name"
              label={
                form.personType === "empresa"
                  ? "Razón Social / Nombre Legal"
                  : "Nombres"
              }
              value={form.name}
              onChange={handleChange}
              required
            />

            {form.personType === "persona" ? (
              <Input
                id="lastName"
                name="lastName"
                label="Apellidos"
                value={form.lastName}
                onChange={handleChange}
              />
            ) : (
              <Input
                id="tradeName"
                name="tradeName"
                label="Nombre Comercial"
                value={form.tradeName}
                onChange={handleChange}
              />
            )}

            <Input
              id="city"
              name="city"
              label="Ciudad"
              value={form.city}
              onChange={handleChange}
            />
            <Input
              id="address"
              name="address"
              label="Dirección"
              value={form.address}
              onChange={handleChange}
            />
            <Input
              id="phone"
              name="phone"
              label="Teléfono"
              value={form.phone}
              onChange={handleChange}
            />
            <Input
              id="email"
              name="email"
              type="email"
              label="Correo Electrónico"
              value={form.email}
              onChange={handleChange}
            />

            {editingId && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Fecha de creación
                </label>
                <input
                  type="text"
                  value={
                    form.createdAt
                      ? new Date(form.createdAt.seconds * 1000).toLocaleString(
                          "es-CO"
                        )
                      : ""
                  }
                  readOnly
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editingId ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ThirdParties;
