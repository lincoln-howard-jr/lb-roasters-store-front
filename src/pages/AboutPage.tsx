import shared from './shared.module.css';
import styles from './about.module.css';
import aboutCustomization from '../texts/about-customization';
import { useApp } from '../AppProvider';

export function AboutPage () {
    const app = useApp ();
    if (!app.router.is ('/about')) return null;
    return (
        <main className={shared.page}>
            <div className={styles.content}>
                <blockquote className={styles.quote}>— do the little things right and it will all work out ok.</blockquote>
                <p>{aboutCustomization}</p>
            </div>
            <div className={styles.content}>
                <blockquote className={styles.quote}>— do the little things right and it will all work out ok.</blockquote>
                <p>{aboutCustomization}</p>
            </div>
            <div className={`${styles.right} ${styles.content}`}>
                <p>{aboutCustomization}</p>
                <blockquote className={`${styles.right} ${styles.quote}`}>do the little things right and it will all work out ok.</blockquote>
                <blockquote className={styles.quote}>— do the little things right and it will all work out ok.</blockquote>
                <p>{aboutCustomization}</p>
                <p>{aboutCustomization}</p>
                <blockquote className={styles.quote}>— what the heck am I trying to say?</blockquote>
            </div>
        </main>
    )
}