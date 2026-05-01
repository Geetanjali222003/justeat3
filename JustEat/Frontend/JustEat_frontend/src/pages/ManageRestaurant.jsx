import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  getMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../api/menuApi";
import { getRestaurant } from "../api/restaurantApi";

const CUISINE_TYPES = [
  "INDIAN",
  "CHINESE",
  "JAPANESE",
  "ITALIAN",
  "MEXICAN",
  "CONTINENTAL",
  "FRENCH",
  "FAST_FOOD",
];
const DIETARY = ["VEG", "NON_VEG", "EGG", "VEGAN", "JAIN", "GLUTEN_FREE"];
const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  cuisineType: "",
  dietaryRestriction: "",
  isSpecial: false,
};

const MenuItemForm = ({
  initial,
  onSubmit,
  submitting,
  error,
  onCancel,
  isEdit,
}) => {
  const [form, setForm] = useState(initial);
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body">
        <h6 className="fw-bold mb-3">
          {isEdit ? "Edit Menu Item" : "New Menu Item"}
        </h6>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form, imageFile);
          }}
        >
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Item Name</label>
              <input
                name="name"
                className="form-control"
                placeholder="e.g. Butter Chicken"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Price (₹)</label>
              <input
                type="number"
                name="price"
                className="form-control"
                placeholder="0.00"
                value={form.price}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                placeholder="Brief description"
                value={form.description}
                onChange={handleChange}
                required
                rows={2}
              />
            </div>
            <div className="col-12">
              <label className="form-label">Image</label>
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={(e) => setImageFile(e.target.files[0])}
                required={!isEdit}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Cuisine Type</label>
              <select
                name="cuisineType"
                className="form-select"
                value={form.cuisineType}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                {CUISINE_TYPES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Dietary</label>
              <select
                name="dietaryRestriction"
                className="form-select"
                value={form.dietaryRestriction}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                {DIETARY.map((d) => (
                  <option key={d} value={d}>
                    {d.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <div className="form-check">
                <input
                  type="checkbox"
                  name="isSpecial"
                  className="form-check-input"
                  checked={form.isSpecial}
                  onChange={handleChange}
                />
                <label className="form-check-label">Chef&apos;s Special</label>
              </div>
            </div>
          </div>
          <div className="d-flex gap-2 mt-3">
            <button
              type="submit"
              className="btn btn-orange"
              disabled={submitting}
            >
              {submitting ? "Saving..." : isEdit ? "Save Changes" : "Add Item"}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ManageRestaurant = () => {
  const { publicId } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [pageError, setPageError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState("");

  const [editingItem, setEditingItem] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  useEffect(() => {
    Promise.all([getRestaurant(publicId), getMenu(publicId)])
      .then(([rRes, mRes]) => {
        setRestaurant(rRes.data);
        setMenuItems(mRes.data);
      })
      .catch(() => setPageError("Failed to load restaurant data."))
      .finally(() => setLoadingPage(false));
  }, [publicId]);

  const handleAdd = async (form, imageFile) => {
    setAddError("");
    if (!imageFile) {
      setAddError("Please select an image");
      return;
    }
    setAddSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", parseFloat(form.price));
      formData.append("description", form.description);
      formData.append("cuisineType", form.cuisineType);
      formData.append("dietaryRestriction", form.dietaryRestriction);
      formData.append("isSpecial", form.isSpecial);
      formData.append("image", imageFile);
      const res = await addMenuItem(publicId, formData);
      setMenuItems((prev) => [...prev, res.data]);
      setShowAddForm(false);
      flash("Menu item added!");
    } catch (err) {
      setAddError(err.response?.data?.message || "Failed to add item.");
    } finally {
      setAddSubmitting(false);
    }
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setEditError("");
    setShowAddForm(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEdit = async (form) => {
    setEditError("");
    setEditSubmitting(true);
    try {
      const res = await updateMenuItem(publicId, editingItem.id, {
        ...form,
        price: parseFloat(form.price),
      });
      setMenuItems((prev) =>
        prev.map((i) => (i.id === editingItem.id ? res.data : i)),
      );
      setEditingItem(null);
      flash("Changes saved!");
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to save changes.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (itemId) => {
    setDeletingId(itemId);
    try {
      await deleteMenuItem(publicId, itemId);
      setMenuItems((prev) => prev.filter((i) => i.id !== itemId));
      flash("Item deleted.");
    } catch {
      /* ignore */
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleToggle = async (item) => {
    setTogglingId(item.id);
    try {
      const res = await updateMenuItem(publicId, item.id, {
        isAvailable: !item.available,
      });
      setMenuItems((prev) =>
        prev.map((i) => (i.id === item.id ? res.data : i)),
      );
      flash(
        `${item.name} marked as ${!item.available ? "available" : "unavailable"}.`,
      );
    } catch {
      /* ignore */
    } finally {
      setTogglingId(null);
    }
  };

  const dietaryBadge = (d) => {
    const map = {
      VEG: "success",
      NON_VEG: "danger",
      EGG: "warning",
      VEGAN: "info",
      JAIN: "secondary",
      GLUTEN_FREE: "primary",
    };
    return map[d] || "secondary";
  };

  if (loadingPage)
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
        <Navbar />
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );

  if (pageError)
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
        <Navbar />
        <div className="container py-5">
          <div className="alert alert-danger">{pageError}</div>
        </div>
      </div>
    );

  const editInitial = editingItem
    ? {
        name: editingItem.name || "",
        description: editingItem.description || "",
        price: editingItem.price ?? "",
        cuisineType: editingItem.cuisineType || "",
        dietaryRestriction: editingItem.dietaryRestriction || "",
        isSpecial: editingItem.isSpecial || false,
      }
    : EMPTY_FORM;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <Navbar />
      <div className="container py-4">
        <button
          onClick={() => navigate("/owner-dashboard")}
          className="btn btn-link text-secondary p-0 mb-2"
        >
          &larr; My Restaurants
        </button>

        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h2 className="fw-bold mb-1">{restaurant?.name}</h2>
            <p className="text-muted small mb-0">
              {restaurant?.location} · Manage menu items
            </p>
          </div>
          {!editingItem && (
            <button
              onClick={() => {
                setShowAddForm((v) => !v);
                setAddError("");
              }}
              className="btn btn-orange"
            >
              {showAddForm ? "Cancel" : "+ Add Item"}
            </button>
          )}
        </div>

        {successMsg && (
          <div className="alert alert-success py-2">{successMsg}</div>
        )}

        {editingItem && (
          <MenuItemForm
            key={editingItem.id}
            initial={editInitial}
            onSubmit={handleEdit}
            submitting={editSubmitting}
            error={editError}
            onCancel={() => {
              setEditingItem(null);
              setEditError("");
            }}
            isEdit
          />
        )}

        {showAddForm && !editingItem && (
          <MenuItemForm
            key="add"
            initial={EMPTY_FORM}
            onSubmit={handleAdd}
            submitting={addSubmitting}
            error={addError}
            onCancel={() => {
              setShowAddForm(false);
              setAddError("");
            }}
            isEdit={false}
          />
        )}

        <h5 className="fw-bold mb-3">
          Menu ({menuItems.length} item{menuItems.length !== 1 ? "s" : ""})
        </h5>

        {menuItems.length === 0 ? (
          <div className="text-center text-muted py-5">
            No menu items yet. Add your first item above.
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className={`card border-0 shadow-sm ${!item.available ? "opacity-50" : ""}`}
              >
                <div className="card-body d-flex align-items-center gap-3">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={{
                        width: 56,
                        height: 56,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 8,
                        background: "#fff3e6",
                      }}
                    />
                  )}

                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="fw-semibold">{item.name}</span>
                      {item.isSpecial && (
                        <span className="badge bg-warning text-dark">
                          Special
                        </span>
                      )}
                      {item.dietaryRestriction && (
                        <span
                          className={`badge bg-${dietaryBadge(item.dietaryRestriction)}`}
                        >
                          {item.dietaryRestriction.replace(/_/g, " ")}
                        </span>
                      )}
                      {!item.available && (
                        <span className="badge bg-secondary">Unavailable</span>
                      )}
                    </div>
                    <small className="text-muted">
                      {item.cuisineType?.replace(/_/g, " ")}
                    </small>
                  </div>

                  <div className="fw-bold" style={{ color: "#fc8019" }}>
                    ₹{item.price?.toFixed(2)}
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <button
                      onClick={() => handleToggle(item)}
                      disabled={togglingId === item.id}
                      className={`btn btn-sm ${item.available ? "btn-outline-success" : "btn-outline-secondary"}`}
                    >
                      {togglingId === item.id
                        ? "..."
                        : item.available
                          ? "On"
                          : "Off"}
                    </button>
                    <button
                      onClick={() => startEdit(item)}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      Edit
                    </button>
                    {confirmDeleteId === item.id ? (
                      <>
                        <span className="small text-muted">Sure?</span>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="btn btn-sm btn-danger"
                        >
                          {deletingId === item.id ? "..." : "Yes"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="btn btn-sm btn-outline-secondary"
                        >
                          No
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageRestaurant;
