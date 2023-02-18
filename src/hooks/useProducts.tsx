import { useEffect, useState } from "react";
import {endpoint} from "../lib/endpoint";
import { AlertFn } from "./useAlert";

export type Product = {
    id: string;
    title: string;
    cost: number;
    shortDescription: string;
    longDescription: string;
    categories: string[];
    tags: string[];
    image?: string;
    isLive: boolean;
    releaseDate: string;
}
export interface CreateProductInputPartial {
    title: string;
    shortDescription: string;
    longDescription: string;
    categories: string[];
    cost: number;
    image?: string;
    tags?: string[];
    isLive: boolean;
    releaseDate: string;
}
export type CreateProductInput = {
    title: string;
    shortDescription: string;
    longDescription: string;
    categories: [string, ...string[]];
    image: string;
    cost: number;
    tags?: string[];
    isLive: boolean;
    releaseDate: string;
}
export type UpdateProductInput = Partial<CreateProductInput>
export type ProductHook = {
    products: Product[],
    getProducts: () => void,
    findProductById: (id: string) => Product | undefined
}
export const productDefaultValues:ProductHook = {
    products: [],
    getProducts: () => {},
    findProductById: () => undefined
}
export default function useProducts (alert: AlertFn):ProductHook {
    
    const [products, setProducts] = useState<Product[]> ([]);

    const getProducts = async () => {
        try {
            const req = await fetch (`${endpoint}/products`)
            const data = await req.json () as Product[];
            setProducts (data);
        } catch (e) {
            alert ('error', 'Error while retrieving products')
        }
    }

    const findProductById = (id: string):Product | undefined => {
        return products.find (prod => prod.id === id);
    }

    useEffect (() => {
        getProducts ();
    }, []);

    return {
        products,
        getProducts,
        findProductById
    }

}

