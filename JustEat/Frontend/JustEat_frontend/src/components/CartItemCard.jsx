const CartItemCard = ({ item, onRemove, removing }) => {
  return (
    <div className="card border-0 shadow-sm p-3 mb-3">
      <div className="d-flex justify-content-between align-items-center gap-3">
        <div className="flex-grow-1">
          <div className="fw-bold mb-1">{item.menuItem?.name || "Item"}</div>
          <div className="text-muted small">
            ₹{item.price?.toFixed(2)} × {item.quantity}
          </div>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="fs-5 fw-bold text-warning">
            ₹{(item.price * item.quantity).toFixed(2)}
          </div>
          <button
            onClick={() => onRemove(item.id)}
            disabled={removing}
            className="btn btn-danger btn-sm"
          >
            {removing ? "..." : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;
