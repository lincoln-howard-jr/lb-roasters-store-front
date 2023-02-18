import { useState } from "react";

export type FreezeFn = (text: string) => () => void;
export type FreezeHook = {
    frozen: string | null;
    freeze: (text: string) => () => void;
}
export const freezeDefaultValue:FreezeHook = {
    frozen: null,
    freeze: () => () => {}
}

export function useFreeze ():FreezeHook {
    // prevent users from doing stuff while they 
    // state mgmt for frozen and then frozen
    const [frozen, setFrozen] = useState<string | null> (null);
    const freeze = (text: string) => {
        setFrozen (text);
        return () => {
            setFrozen (null);
        }
    }

    return {
        frozen,
        freeze
    };
}