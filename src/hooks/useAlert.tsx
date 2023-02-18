import { useState } from "react";

type AlertAction = {
    name: string,
    onAction: () => void
}
export type AlertFn = (type: 'error' | 'warning' | 'info', text: string, header?: string | undefined, actions?: AlertAction[], delay?: number) => () => void;
export type AlertHook = {
    alert: AlertFn;
    closeAlert: () => void;
    alertOpen: boolean;
    alertType: 'error' | 'warning' | 'info' | '';
    alertText: string;
    alertActions: AlertAction[];
    alertHeader?: string;
}
export const alertDefaultValues:AlertHook = {
    alert: () => () => {},
    closeAlert: () => {},
    alertOpen: false,
    alertType: '',
    alertText: '',
    alertActions: []
}

export function useAlert ():AlertHook {
    // system for alerting a user of important stuff while they are on the site
    // state mgmt for alert then close alert and alert
    const [alertOpen, setAlertOpen] = useState<boolean> (false);
    const [alertType, setAlertType] = useState<'error' | 'warning' | 'info' | ''> ('');
    const [alertHeader, setAlertHeader] = useState<string | undefined> (undefined);
    const [alertText, setAlertText] = useState<string> ('');
    const [alertActions, setAlertActions] = useState<AlertAction []> ([]);
    const [alertTimeoutId, setTID] = useState<any> ();
    const closeAlert = () => {
        setAlertOpen (false);
        setAlertType ('');
        setAlertText ('');
        setAlertHeader (undefined);
        setAlertActions ([]);
        if (alertTimeoutId) clearTimeout (alertTimeoutId);
    }
    const closeOnClick = (e: MouseEvent) => {
        closeAlert ();
        window.removeEventListener ('click', closeOnClick);
    }
    const alert = (type: 'error' | 'warning' | 'info', text: string, header?: string | undefined, actions?: AlertAction[], delay=10) => {
        setAlertOpen (true);
        setAlertType (type);
        setAlertText (text);
        setAlertHeader (header);
        setAlertActions (actions || []);
        setTID (setTimeout (closeAlert, delay * 1000));
        setTimeout (() => window.addEventListener ('click', closeOnClick), 300);
        return closeAlert;
    }

    return {
        alertOpen,
        alertType,
        alertHeader,
        alertText,
        alertActions,
        alert,
        closeAlert
    }
}