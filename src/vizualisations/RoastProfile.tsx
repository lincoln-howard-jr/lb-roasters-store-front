import { MouseEventHandler, TouchEventHandler, useRef, useState } from 'react';
import { Bean } from './Bean';
import styles from './roast-profile.module.css';
export const labels = [
    'lightest',
    'light',
    'medium-light',
    'medium',
    'medium-dark',
    'dark',
    'darker',
    'darkest'
] as const;
export type RaostProfileLabel = typeof labels[number];
const unit = 5;
const padding = 6;
const width = 100;
const height = 50;
const range = labels.length - 1;

function minmax (min: number, value: number, max: number) {
    return Math.min (Math.max (min, value), max);
}

type RoastProfileProps = {
    defaultValue: RaostProfileLabel;
    onChange?: (value: RaostProfileLabel) => void;
}

export function RoastProfile (props: RoastProfileProps) {
    const svgref = useRef<SVGSVGElement> (null);
    const [value, setValue] = useState<number> (labels.indexOf (props.defaultValue) );

    const scaleX = (value: number):number => padding + value * (width - 2 * padding) / range;
    const labelX = (value: number):string => labels [Math.round (value)];

    const [mouseIsDown, setMouseIsDown] = useState<boolean> (false);
    const setValueFromClientX = (clientX: number) => {
        if (!svgref.current || !mouseIsDown) return;
        const offset = clientX - svgref.current.getBoundingClientRect ().left;
        const scale = width / svgref.current.clientWidth;
        const adjustedOffset = offset * scale - padding;
        const domainWidth = width - padding * 2;
        const finalOffset = adjustedOffset / domainWidth;
        const val = finalOffset * range;
        setValue (minmax (0, val, range));
    }
    const handleKeyDown:React.KeyboardEventHandler<SVGSVGElement> = e => {
        e.preventDefault ();
        if ((e.key === 'ArrowDown' || e.key === 'Down') && value < range) setValue (minmax (0, value + 1, range));
        if ((e.key === 'ArrowUp' || e.key === 'Up') && value > 0) setValue (minmax (0, value - 1, range));
    }
    const drag:TouchEventHandler<SVGSVGElement> = (e) => {
        setValueFromClientX (e.touches [0].screenX);
    }
    const mouse:MouseEventHandler<SVGSVGElement> = (e) => {
        setValueFromClientX (e.clientX);
    }
    const touchCancel = () => {
        setMouseIsDown (false);
        if (props.onChange) props.onChange (labels [Math.round (value)]);
    }

    return (
        <svg tabIndex={2} ref={svgref} onKeyDown={handleKeyDown} onTouchMove={drag} onTouchCancel={touchCancel} onMouseMove={mouse} onMouseLeave={touchCancel} onMouseUp={touchCancel} className={styles ['roast-profile']} viewBox={`0 0 ${unit * width} ${unit * height}`}>
            <circle cy={unit * height / 2} cx={(scaleX (0) - 1) * unit} r={unit} />
            <circle cy={unit * height / 2} cx={(scaleX (range) + 1) * unit} r={unit} />
            <line y1={unit * height / 2} x1={unit * scaleX (0)} y2={unit * height / 2} x2={unit * scaleX (range)} />
            <Bean onTouch={() => setMouseIsDown (true)} className={styles.bean} cy={unit * height / 2} cx={unit * scaleX (value)} size={unit * 3} />
            <line y1={unit * (4 + height / 2)} y2={unit * (6 + height / 2)} x1={unit * scaleX (value)} x2={unit * scaleX (value)} />
            <text y={unit * (8 + height / 2)} x={unit * scaleX (value)} alignmentBaseline="middle" textAnchor="middle">{labelX (value)}</text>
        </svg>
    )
}