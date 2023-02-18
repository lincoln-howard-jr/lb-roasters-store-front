import { AlertHook } from "../hooks/useAlert";
import alertStyles from './alert.module.css'

export function Alert (props: AlertHook) {
    return (
        <div className={`${alertStyles.alert} ${alertStyles [props.alertType]} ${props.alertOpen ? alertStyles.open : ''}`}>
            <p>
            {
                props.alertHeader &&
                <>
                <span className={alertStyles.header}>
                    {props.alertHeader}
                </span>
                <br />
                </>
            }
            {props.alertText}
            {
                props.alertActions.length > 0 &&
                <>
                <br />
                {
                    props.alertActions.map (action => (
                        <span className={alertStyles ['alert-action']} onClick={() => {action.onAction (); props.closeAlert ();}}>{action.name}</span>
                    ))
                }
                </>
            }
            </p>
        </div>
    )
}