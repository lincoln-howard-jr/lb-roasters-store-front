import { useApp } from "../AppProvider";
import s3Url from "../lib/s3Url";
import shared from './shared.module.css';
import styles from './coffees-page.module.css';

export function CoffeesPage () {
    const app = useApp ();

    if (!app.router.is ('/coffee')) return null;
    return (
        <main className={shared.page}>
            <ul className={styles ['card-list']}>
                {app.products.products.map (product => (
                    <li className={styles.card}>
                        {
                            product.image &&
                            <img onClick={() => app.router.redirect (`/coffees/${product.id}`)} src={`${s3Url}${product.image}`} />
                        }
                        <h3>{product.title}</h3>
                        <p>{product.shortDescription}</p>
                    </li>
                ))}
            </ul>
        </main>
    )
}