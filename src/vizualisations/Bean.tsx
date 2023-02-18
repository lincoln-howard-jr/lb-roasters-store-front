type BeanProps = {
    cx: number;
    cy: number;
    size: number;
    onTouch?: () => any;
    className?: string;
    standalone?: boolean;
}
const angle = 15;
const curveA = (props: BeanProps) => `C ${props.cx} ${props.cy + props.size * 1.2}, ${props.cx + props.size / 2} ${props.cy + props.size * 0.6}, ${props.cx} ${props.cy}`;
const curveB = (props: BeanProps) => `C ${props.cx} ${props.cy}, ${props.cx - props.size / 2} ${props.cy - props.size * 0.6}, ${props.cx} ${props.cy - props.size * 1.2}`;
export function Bean (props: BeanProps) {
    if (props.standalone) return (
        <svg viewBox={`0 0 ${props.cx * 2} ${props.cy * 2}`}>
            <Bean cx={props.cx} cy={props.cy} size={props.size} />
        </svg>
    )
    return (
        <g origin={`${props.cx} ${props.cy}`} transform={`rotate(${angle} ${props.cx} ${props.cy})`} className={props.className}>
            <ellipse fill="white" stroke="black" onTouchStart={props.onTouch} onMouseDown={props.onTouch} cx={props.cx} cy={props.cy} rx={props.size} ry={props.size * 1.2} />
            <path stroke="black" d={`M ${props.cx} ${props.cy + props.size * 1.2}  ${curveA (props)} ${curveB (props)}`} fill="none" />
        </g>
    )
}