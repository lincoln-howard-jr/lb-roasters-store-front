import { useApp } from "../AppProvider"
import { RaostProfileLabel, RoastProfile } from "../vizualisations/RoastProfile";
import shared from './shared.module.css';
import styles from './customize.module.css';
import { OriginBlend, OriginBlendPortion } from "../vizualisations/OriginBlend";
import { DragEvent, useEffect, useState } from "react";
import { Product } from "../hooks/useProducts";
import s3Url from "../lib/s3Url";
import { labels } from "../vizualisations/RoastProfile";
import DragBean from '../assets/bean.svg';

const fauxDragImage = new Image ();
const dragImage = new Image ();
const canvas = document.createElement ('canvas');
canvas.width = 25;
canvas.height = 25;
const ctx = canvas.getContext ('2d');
fauxDragImage.onload = async () => {
    if (!ctx) return;
    const data = await createImageBitmap (fauxDragImage, {
        resizeQuality: 'high',
        resizeWidth: 25,
        resizeHeight: 25
    });
    ctx?.drawImage (data, 0, 0, 25, 25);
    dragImage.src = canvas.toDataURL ();
}
fauxDragImage.src = DragBean;
export function Customize () {
    const app = useApp ();
    const [dragProduct, setDragProduct] = useState<Product | null> (null);
    const [origins, setOrigins] = useState<OriginBlendPortion[]> ([]);
    const [roastProfile, setRoastProfile] = useState<RaostProfileLabel> (labels [0]);
    const setOriginAtIndex = (index: number, origin: OriginBlendPortion[]) => {
        const diff = origins [index].percentage - (origin [0]?.percentage || 0);
        const newOrigins = [
            ...origins.slice (0, index),
            ...origin,
            {...origins [index + 1], percentage: origins [index + 1].percentage + diff, start: origins [index + 1].start - diff},
            ...origins.slice (index + 2)
        ].filter (o => o.percentage > 0);
        setOrigins (newOrigins)
    }
    const addProductAsOrigin = (product: Product) => {
        if (origins.length === 0) return setOrigins ([{origin: product.id, percentage: 100, start: 0}])
        if (origins.length === 1) return setOrigins([
            {...origins [0], percentage: 50, start: 0},
            {origin: product.id, percentage: 50, start: 50}
        ])
        const percentAdjustedOrigins = origins.map<OriginBlendPortion> (o => o.percentage < 10 ? o : {...o, percentage: o.percentage - 5});
        const newOrigins = percentAdjustedOrigins.reduce<OriginBlendPortion[]> ((all, o) => {
            return [
                ...all,
                {...o, start: (all.at (-1)?.start || 0) + (all.at (-1)?.percentage || 0)}
            ]
        }, [])
        const leftover = 100 - newOrigins.reduce ((sum, o) => sum + o.percentage, 0)
        newOrigins.push ({
            percentage: leftover,
            start: (newOrigins.at (-1)?.start || 0) + (newOrigins.at (-1)?.percentage || 0),
            origin: product.id
        })
        setOrigins (newOrigins);
    }

    const dragStart = (product: Product) => (event: DragEvent) => {
        event.dataTransfer.setDragImage (dragImage, 0, 0)
        console.log (`dragging ${product.title}`)
        setDragProduct (product);
    }
    const cancel = (e: DragEvent) => {
        e.preventDefault ();
    }
    const onDrop = (e: DragEvent) => {
        e.preventDefault ();
        console.log (`dropping ${dragProduct?.title}`);
        if (dragProduct) addProductAsOrigin (dragProduct);
    }

    useEffect (() => {
        document.body.style.overflow = app.router.is ('/') ? 'hidden' : 'auto';
    }, [app.router.page])

    useEffect (() => {
        const clearSelection = () => window.requestAnimationFrame (() => document.getSelection()?.removeAllRanges ());
        'touchstart touchmove touchcancel touchend'.split (' ').forEach (evt => window.addEventListener (evt, clearSelection));
    }, [])

    if (!app.router.is ('/')) return null;
    return (
        <main className={shared.page}>
            <div className={styles.customizer}>
                <div className={styles.summary}>
                    <div>
                        <p>
                            Your personal blend has {origins.length > 0 ? origins.length : 'no'} coffee{origins.length !== 1 ? 's' : ''} selected!
                        </p>
                        {
                            origins.length > 0 &&
                            <ul>
                                {
                                    origins.map (origin => app.products.findProductById (origin.origin)).map ((product, i) => (
                                        <li>{product?.title} - {origins [i].percentage.toFixed (0)}%</li>
                                    ))
                                }
                            </ul>
                        }
                    </div>
                </div>
                <div className={shared.scrollable + ' ' + styles.box}>
                    {/* Description of creating a blend */}
                    <div className={shared.panel}>
                        <h1 className={shared.title}>Create Your Blend</h1>
                        <p style={{textAlign: 'center'}}></p>
                        <div onClick={e => e.currentTarget.parentElement?.nextElementSibling?.scrollIntoView (true)} className={styles.next}>
                            <span>Start</span>
                        </div>
                    </div>
                    {/* pick blend*/}
                    <div className={`${shared.panel}`}>
                        <div onClick={e => e.currentTarget.parentElement?.previousElementSibling?.scrollIntoView (true)} className={styles.prev}>
                            <span>Previous</span>
                        </div>
                        <figure className={styles.blend}>
                            <figcaption>
                                <span className={shared.bold}>Step 1</span>
                                <br />
                                Pick your origin blend!
                            </figcaption>
                            <div>
                                <div onDragEnter={cancel} onDragOver={cancel} onDrop={onDrop}>
                                    <OriginBlend origins={origins} onChange={setOriginAtIndex} />
                                </div>
                                <ul className={styles.coffees}>
                                    {
                                        app.products.products.filter (p => !origins.find (o => o.origin === p.id)).map (product => (
                                            <li draggable onDragStart={dragStart (product)} onClick={() => addProductAsOrigin (product)}>
                                                {product.title}
                                                {
                                                    product.image &&
                                                    <img src={`${s3Url}${product.image}`} />
                                                }
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                        </figure>
                        <div onClick={e => e.currentTarget.parentElement?.nextElementSibling?.scrollIntoView (true)} className={styles.next}>
                            <span>Next</span>
                        </div>
                    </div>
                    {/* select the roast profile */}
                    <div className={shared.panel}>
                        <div onClick={e => e.currentTarget.parentElement?.previousElementSibling?.scrollIntoView (true)} className={styles.prev}>
                            <span>Previous</span>
                        </div>
                        <figure className={styles.profile}>
                            <figcaption>
                                <span className={shared.bold}>Step 2</span>
                                <br />
                                Choose your roast profile!
                            </figcaption>
                            <RoastProfile onChange={setRoastProfile} defaultValue={roastProfile} />
                        </figure>
                    </div>
                </div>
            </div>

        </main>
    )
}