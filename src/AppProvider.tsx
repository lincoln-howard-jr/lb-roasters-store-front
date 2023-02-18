import { createContext, JSXElementConstructor, ReactElement, ReactFragment, useContext } from "react";
import { Alert } from "./components/Alert";
import { Freeze } from "./components/Freeze";
import { alertDefaultValues, AlertFn, useAlert } from "./hooks/useAlert";
import { freezeDefaultValue, FreezeFn, useFreeze } from "./hooks/useFreeze";
import useProducts, { productDefaultValues, ProductHook } from "./hooks/useProducts";
import useRouter, { routerDefaultValues, RouterHook } from "./hooks/useRouter";

type ContextValue = {
    alert: AlertFn;
    freeze: FreezeFn;
    router: RouterHook;
    products: ProductHook;
}
const defaultContextValue:ContextValue = {
    alert: alertDefaultValues.alert,
    freeze: freezeDefaultValue.freeze,
    router: routerDefaultValues,
    products: productDefaultValues
}

// useful application stuff
const AppCtx = createContext<ContextValue> (defaultContextValue);
export const useApp = () => useContext (AppCtx);
export function AppProivder (props: { children: ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment | null | undefined; }) {

    const alert = useAlert ();
    const freeze = useFreeze ();
    const router = useRouter ();
    const products = useProducts (alert.alert);

    const value:ContextValue = {
        alert: alert.alert,
        freeze: freeze.freeze,
        router,
        products
    }
    return (
        <AppCtx.Provider value={value}>
            <Alert {...alert} />
            <Freeze {...freeze} />
            {props.children}
        </AppCtx.Provider>
    )
}