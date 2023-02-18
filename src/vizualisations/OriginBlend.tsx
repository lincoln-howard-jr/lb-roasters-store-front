import { MouseEventHandler, TouchEventHandler, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../AppProvider';
import { Product } from '../hooks/useProducts';
import { Bean } from './Bean';
import styles from './origin-blend.module.css';

const unit = 6;
const padding = 10;
const width = 150;
const height = 50;

export type OriginBlendPortion = {
    origin: string;
    percentage: number;
    start: number;
}
type OriginBlendDisplay = OriginBlendPortion & {
    product?: Product;
}
type OriginBlendProps = {
    origins: OriginBlendPortion[];
    onChange: (index: number, origin: OriginBlendPortion[]) => void;
    onDrop?: () => void;
    className?: string;
}
function minmax (min: number, value: number, max: number) {
    return Math.min (Math.max (min, value), max);
}
export function OriginBlend (props: OriginBlendProps) {
    const app = useApp ();
    const svgref = useRef<SVGSVGElement>(null);
    const [beanSize, setBeanSize] = useState<number>(2);
    const [touchIndex, setTouchIndex] = useState<number | null> (null);
    const scaleX = (value: number) => {
        return padding + (width - 2 * padding) * value / 100;
    }
    const invX = (clientX: number) => {
        if (!svgref.current || touchIndex === null) return;
        const origin = props.origins [touchIndex];
        const offset = clientX - svgref.current.getBoundingClientRect ().left;
        const scale = width / svgref.current.clientWidth;
        const adjustedOffset = offset * scale - padding;
        const domainWidth = width - padding * 2;
        const finalOffset = adjustedOffset / domainWidth;
        const percentage = 100 * finalOffset - origin.start;
        props.onChange (touchIndex, [{...origin, percentage: minmax(0, percentage, 100)}])
    }
    const reducer = (acc:OriginBlendDisplay[], origin:OriginBlendPortion):OriginBlendDisplay[] => {
        const product = app.products.findProductById (origin.origin);
        return [...acc, {...origin, product}]
    }
    useEffect (() => {
        if (svgref.current) setBeanSize (1.75 * width * unit / svgref.current.clientWidth)
        window.addEventListener ('resize', () => {
            if (svgref.current) setBeanSize (1.75 * width * unit / svgref.current.clientWidth)
        })
    }, [])
    const touchBean = (index: number) => {
        setTouchIndex (index);
    }
    const drag:TouchEventHandler<SVGSVGElement> = (e) => {
        e.preventDefault ();
        e.stopPropagation ();
        invX (e.touches [0].screenX);
        return false;
    }
    const mouse:MouseEventHandler<SVGSVGElement> = (e) => {
        invX (e.clientX);
    }
    useEffect (() => {
        setTouchIndex (null);
    }, [props.origins.length])
    return (
        <svg ref={svgref} onTouchMove={drag} onTouchCancel={() => setTouchIndex (null)} onMouseLeave={() => setTouchIndex (null)} onMouseUp={() => setTouchIndex (null)} onMouseMove={mouse} className={`${styles.blend} ${props.className}`} tabIndex={1} viewBox={`0 0 ${unit * width} ${unit * height}`}>
            <line x1={padding * unit} x2={padding * unit} y1={unit * (height / 2 - 3)} y2={unit * (height / 2 + 3)} />
            <line x1={(width - padding) * unit} x2={(width - padding) * unit} y1={unit * (height / 2 - 3)} y2={unit * (height / 2 + 3)} />
            {
                props.origins.reduce<OriginBlendDisplay[]> (reducer, []).map (origin => (
                    <g className={styles.coffee}>
                        <line x1={unit * scaleX (origin.start)} x2={unit * scaleX (origin.start + origin.percentage)} y1={unit * height / 2} y2={unit * height / 2} />
                        <text textAnchor='middle' x={unit * scaleX (origin.start + origin.percentage / 2)} y={unit * (3 * unit + height / 2)}>{`${origin.percentage.toFixed (0)}%`}</text>
                        {
                            origin.product &&
                            <text textAnchor='middle' x={unit * scaleX (origin.start + origin.percentage / 2)} y={unit * (4 * unit + height / 2)}>{`${origin.product.title}`}</text>
                        }
                    </g>
                ))
            }
            {
                props.origins.reduce<OriginBlendDisplay[]> (reducer, []).map ((origin, i, arr) => (
                    arr.length - i > 1 &&
                    <Bean className={styles.bean} onTouch={() => touchBean (i)} cx={unit * scaleX (origin.start + origin.percentage)} cy={unit * height / 2} size={beanSize * unit} />
                ))
            }
        </svg>
    )
}