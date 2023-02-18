import { useApp } from '../AppProvider'
import Logo from '../assets/Logo.png'
import styles from './header.module.css';

export function Header () {
    const app = useApp ();

    return (
        <header className={styles.header}>
            <nav className={styles.nav}>
                <ol className={styles.links}>
                    <li className={app.router.is ('/coffee') ? styles.active : ''} onClick={() => app.router.redirect ('/coffee')}>
                        Coffee
                    </li>
                    <li className={app.router.is ('/guides') ? styles.active : ''} onClick={() => app.router.redirect ('/guides')}>
                        Guides
                    </li>
                    <li className={app.router.is ('/') ? styles.active : ''} onClick={() => app.router.redirect ('/')}>
                        <img src={Logo} />
                    </li>
                    <li className={app.router.is ('/about') ? styles.active : ''} onClick={() => app.router.redirect ('/about')}>
                        About
                    </li>
                    <li className={app.router.is ('/contact') ? styles.active : ''} onClick={() => app.router.redirect ('/contact')}>
                        Contact
                    </li>
                </ol>
            </nav>
        </header>
    )
}