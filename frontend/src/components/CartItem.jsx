function CartItem({ item, onUpdateQuantity, onRemove }) {
  const { product, quantity } = item;

  return (
    <div className="cart-item">
      <img src={product.image} alt={product.name} />
      <div className="cart-item-info">
        <h3>{product.name}</h3>
        <span className="chip">{product.category}</span>
        <p className="price">₹{product.price.toLocaleString("en-IN")}</p>

        <div className="qty-controls">
          <button
            onClick={() => onUpdateQuantity(product._id, quantity - 1)}
            disabled={quantity <= 1}
          >
            −
          </button>
          <span className="qty-value">{quantity}</span>
          <button
            onClick={() => onUpdateQuantity(product._id, quantity + 1)}
            disabled={quantity >= product.stock}
          >
            +
          </button>
        </div>

        <p className="item-total">
          Subtotal: ₹{(product.price * quantity).toLocaleString("en-IN")}
        </p>

        <button className="remove-btn" onClick={() => onRemove(product._id)}>
          Remove
        </button>
      </div>
    </div>
  );
}

export default CartItem;
