const GUEST_CART_KEY = "guest_cart";

export interface GuestCartItem {
  product_id: string;
  quantity: number;
  price_at_add: string;
  added_at: string;
}

export const getGuestCart = (): GuestCartItem[] => {
  const stored = localStorage.getItem(GUEST_CART_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const saveGuestCart = (cart: GuestCartItem[]): void => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
};

export const addToGuestCart = (
  productId: string,
  quantity: number,
  priceAtAdd: string,
): void => {
  const cart = getGuestCart();
  const existingIndex = cart.findIndex((item) => item.product_id === productId);

  if (existingIndex >= 0) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      product_id: productId,
      quantity,
      price_at_add: priceAtAdd,
      added_at: new Date().toISOString(),
    });
  }

  saveGuestCart(cart);
};

export const updateGuestCartQuantity = (
  productId: string,
  quantity: number,
): void => {
  const cart = getGuestCart();
  const existingIndex = cart.findIndex((item) => item.product_id === productId);

  if (existingIndex >= 0) {
    if (quantity <= 0) {
      cart.splice(existingIndex, 1);
    } else {
      cart[existingIndex].quantity = quantity;
    }
    saveGuestCart(cart);
  }
};

export const removeFromGuestCart = (productId: string): void => {
  const cart = getGuestCart();
  const filtered = cart.filter((item) => item.product_id !== productId);
  saveGuestCart(filtered);
};

export const clearGuestCart = (): void => {
  localStorage.removeItem(GUEST_CART_KEY);
};

export const getGuestCartCount = (): number => {
  const cart = getGuestCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
};
