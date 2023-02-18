import { FreezeHook } from "../hooks/useFreeze";
import freezeStyles from './freeze.module.css';

export function Freeze (props: FreezeHook) {
    return (
        <div className={`${freezeStyles.freeze} ${props.frozen ? freezeStyles.frozen : ''}`}>
            <div className={freezeStyles ['frozen-content']}>
                {props.frozen}
            </div>
        </div>
    )
}