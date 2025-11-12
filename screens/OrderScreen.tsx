import React from 'react';
import { XMarkIcon } from '../constants';
import type { CartItem, Screen } from '../types';

interface OrderScreenProps {
    cart: CartItem[];
    updateCartItemQuantity: (coffeeId: number, quantity: number) => void;
    setActiveScreen: (screen: Screen) => void;
}

const CartItemComponent: React.FC<{ item: CartItem, updateQuantity: (id: number, q: number) => void }> = ({ item, updateQuantity }) => {
    return (
        <div className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-4">
            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
            <div className="flex-1 overflow-hidden">
                <p className="font-bold truncate">{item.name}</p>
                <p className="text-sm text-cafa-text-secondary">${item.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 bg-gray-200 rounded-full font-bold text-cafa-text-secondary flex items-center justify-center">-</button>
                <span className="w-4 text-center font-semibold">{item.quantity}</span>
                <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 bg-gray-200 rounded-full font-bold text-cafa-text-secondary flex items-center justify-center">+</button>
            </div>
             <button onClick={() => updateQuantity(item.id, 0)} className="text-gray-400 hover:text-red-500 flex-shrink-0">
                <XMarkIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

const OrderScreen: React.FC<OrderScreenProps> = ({ cart, updateCartItemQuantity, setActiveScreen }) => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    if (cart.length === 0) {
        return (
            <div className="p-4 text-center h-[calc(100vh-10rem)] flex flex-col justify-center items-center">
                <h1 className="text-2xl font-bold text-cafa-text-primary">Your Order</h1>
                <p className="text-cafa-text-secondary mt-2">Your cart is empty. Add some coffee from the menu!</p>
                <button 
                    onClick={() => setActiveScreen('Stores')}
                    className="mt-6 bg-cafa-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-cafa-primary/90 transition-colors">
                    Browse Menu
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-cafa-text-primary">Your Order</h1>
            </header>
            
            <div className="space-y-4">
                {cart.map(item => (
                    <CartItemComponent key={item.id} item={item} updateQuantity={updateCartItemQuantity} />
                ))}
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm space-y-3">
                <h2 className="text-lg font-bold">Order Summary</h2>
                <div className="flex justify-between text-cafa-text-secondary">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-cafa-text-secondary">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-cafa-text-primary text-lg border-t pt-3 mt-2">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </div>

            <button className="w-full bg-cafa-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-cafa-primary/90 transition-colors">
                Proceed to Checkout
            </button>
        </div>
    );
};

export default OrderScreen;
