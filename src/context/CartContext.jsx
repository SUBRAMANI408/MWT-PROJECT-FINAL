import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // --- Function to increase quantity ---
    const increaseQuantity = (medicineId) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item._id === medicineId ? { ...item, quantity: item.quantity + 1 } : item
            )
        );
    };

    // --- Function to decrease quantity ---
    const decreaseQuantity = (medicineId) => {
        setCartItems(prevItems =>
            prevItems
                .map(item =>
                    item._id === medicineId
                        ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1 }
                        : item
                )
                .filter(item => item.quantity > 0)
        );
    };

    // --- Function to add an item to the cart ---
    const addItemToCart = (medicine) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item._id === medicine._id);
            if (existingItem) {
                return prevItems.map(item =>
                    item._id === medicine._id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevItems, { ...medicine, quantity: 1 }];
            }
        });
        alert(`${medicine.name} added to cart!`);
    };

    // --- Function to remove an item from the cart ---
    const removeItemFromCart = (medicineId) => {
        setCartItems(prevItems => prevItems.filter(item => item._id !== medicineId));
    };

    // --- ✅ NEW FUNCTION: Clear the entire cart ---
    const clearCart = () => {
        setCartItems([]);
    };

    // --- Export all functions and state ---
    const value = {
        cartItems,
        addItemToCart,
        removeItemFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart, // <-- New function added here
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
