import { useNavigate } from "react-router-dom";

function WishlistCard({ product, onRemove }) {
  const navigate = useNavigate();

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <div className="product-info">
        <h3>{product.name}</h3>
        <span className="chip">{product.category}</span>
        <p className="price">₹{product.price.toLocaleString("en-IN")}</p>
        <p className={product.stock > 0 ? "in-stock" : "out-of-stock"}>
          {product.stock > 0 ? `${product.stock} units left` : "Out of stock"}
        </p>
        <button onClick={() => navigate(`/products/${product._id}`)}>View Details</button>
        <button className="remove-btn" onClick={() => onRemove(product._id)}>
          Remove ♥
        </button>
      </div>
    </div>
  );
}

export default WishlistCard;
