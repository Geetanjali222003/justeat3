const CartItemCard = ({ item, onRemove, removing }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md flex justify-between items-center gap-4">
      <div className="flex-1">
        <div className="font-bold text-base text-gray-900 dark:text-white">
          {item.menuItem?.name || "Item"}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          ₹{item.price?.toFixed(2)} × {item.quantity}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-lg font-extrabold text-orange-500">
          ₹{(item.price * item.quantity).toFixed(2)}
        </div>
        <button
          onClick={() => onRemove(item.id)}
          disabled={removing}
          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-semibold px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer"
        >
          {removing ? "..." : "Remove"}
        </button>
      </div>
    </div>
  );
};

export default CartItemCard;

