import { useEffect, useState } from "react";
import {endpoint} from "../lib/endpoint";
import { alerter, AlertFn } from "./useAlert";
import { FreezeFn, freezer } from "./useFreeze";
import { user, UserHook } from "./useUser";
import {v4 as id} from 'uuid';

export interface CartItem {
    id: string;
    productId: string;
    quantity: number;
    createdAt: number;
}
function useCart (user: UserHook, alert: AlertFn, freeze: FreezeFn) {
    const [items, setItems] = useState<CartItem[]> ([]);
    const getItems = async () => {
        try {
            const req = await fetch (`${endpoint}/cart`, {
                headers: user.headers.get
            })
            setItems (await req.json ());
        } catch (err) {
            alert ('error', 'Error while loading cart')
        }
    }
    const addItem = async (productId: string, quantity: number = 1) => {
        const foundIndex = items.findIndex (item => item.productId === productId);
        if (!user.isAuthenticated) {
            if (foundIndex === -1) return setItems ([...items, {id: id (), productId, quantity, createdAt: Date.now ()}])
            return setItems ([
                ...items.slice (0, foundIndex),
                {...items [foundIndex], quantity: items [foundIndex].quantity + quantity},
                ...items.slice (foundIndex + 1)
            ]);
        }
        let unfreeze = freeze (`Just a moment...`);
        try {
            const body:{productId: string, quantity: number, id?:string} = {
                productId,
                quantity
            }
            if (foundIndex !== -1) {
                body.quantity += items [foundIndex].quantity;
                body.id = items [foundIndex].id
            }
            await fetch (`${endpoint}/cart`, {
                method: 'post',
                headers: user.headers.post,
                body: JSON.stringify (body)
            })
            getItems ();
            alert ('info', 'Added to cart :)');
        } catch (err) {
            alert ('error', 'Error while adding cart item');
        } finally {
            unfreeze ();
        }
    }
    const deleteItem = async (id: string) => {
        if (!user.isAuthenticated) {
            return setItems (items.filter (item => item.id !== id));
        }
        try {
            await fetch (`${endpoint}/cart/${id}`, {
                method: 'delete',
                headers: user.headers.get
            });
            getItems ();
            alert ('info', 'Item removed from cart');
        } catch (err) {
            alert ('error', 'Error while removing item from cart')
        }
    }
    useEffect (() => {
        if (user.isAuthenticated) getItems ();
    }, [user.isAuthenticated]);

    return {
        items,
        addItem,
        deleteItem
    }
}
export const cart = useCart (user, alerter.alert, freezer.freeze);
export type CartHook = typeof cart;