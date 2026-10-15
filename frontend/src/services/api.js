import axios from "axios";

// Change this to the URL where your backend runs
const api = axios.create({
  baseURL: "http://localhost:5001",
  withCredentials: true, // sends and receives cookies
});

// ---- Auth / Customer service functions ----

export const registerCustomer = (data) => api.post("/customers/register", data);
export const loginCustomer = (data) => api.post("/customers/login", data);
export const getMe = () => api.get("/customers/me");
export const logoutCustomer = () => api.post("/customers/logout");

// ---- Product service functions ----

// params example: { search: "phone", category: "Electronics", sort: "price_asc" }
export const fetchProducts = (params = {}) => {
  const query = {};
  if (params.search) query.search = params.search;
  if (params.category) query.category = params.category;
  if (params.sort) query.sort = params.sort;
  return api.get("/products", { params: query });
};

export const fetchProductById = (id) => api.get(`/products/${id}`);

// ---- Wishlist service functions ----

export const fetchWishlist = () => api.get("/wishlist");
export const addToWishlistAPI = (productId) => api.post(`/wishlist/${productId}`);
export const removeFromWishlistAPI = (productId) => api.delete(`/wishlist/${productId}`);
export const toggleWishlistAPI = (productId) => api.patch(`/wishlist/${productId}/toggle`);

// ---- Cart service functions ----

export const fetchCart = () => api.get("/cart");
export const addToCartAPI = (productId) => api.post(`/cart/${productId}`);
export const updateCartItemAPI = (productId, quantity) => api.patch(`/cart/${productId}`, { quantity });
export const removeFromCartAPI = (productId) => api.delete(`/cart/${productId}`);

// ---- Order service functions ----

export const createPaymentOrderAPI = (shippingAddress) => api.post("/orders/create-payment-order", { shippingAddress });
export const verifyPaymentAPI = (data) => api.post("/orders/verify-payment", data);
export const fetchOrders = () => api.get("/orders");
export const fetchOrderById = (id) => api.get(`/orders/${id}`);

export default api;
