import { useEffect, useState } from "react";

type LocalStorageArgs<T> = {
    key: string;
    parse: (raw: string) => T;
    write: (value: T) => string;
    defaultValue: T;
}

type LocalStorageHook<T> = [T, (value: T) => void];

export function useLocalStorage<T> (args: LocalStorageArgs<T>):LocalStorageHook<T> {
    const [value, _setValue] = useState<T> (args.defaultValue);
    useEffect (() => {
        const raw = localStorage.getItem (args.key);
        const init = raw ? args.parse (raw) : args.defaultValue;
        _setValue (init)
    }, [args.key])
    function setValue (value: T) {
        _setValue (value);
        localStorage.setItem (args.key, args.write (value));
    }
    return [value, setValue];
}