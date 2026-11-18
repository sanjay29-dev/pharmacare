
import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (medicine) => {
    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.medicineId === medicine.medicineId
      );

      if (existing) {
        return currentCart.map((item) =>
          item.medicineId === medicine.medicineId
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + 1,
                  item.availableQty
                ),
              }
            : item
        );
      }

      if (medicine.availableQty <= 0) {
        return currentCart;
      }

      return [
        ...currentCart,
        {
          medicineId: medicine.medicineId,
          name: medicine.name,
          genericName: medicine.genericName || "",
          categoryName: medicine.categoryName || "",
          availableQty: Number(medicine.availableQty),
          sellingPrice: Number(medicine.sellingPrice || 0),
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (medicineId, quantity) => {
    const parsedQuantity = Number(quantity);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.medicineId === medicineId
          ? {
              ...item,
              quantity: Math.min(parsedQuantity, item.availableQty),
            }
          : item
      )
    );
  };

  const removeFromCart = (medicineId) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.medicineId !== medicineId)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
