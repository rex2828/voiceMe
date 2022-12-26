import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';
import { logout } from '../../http/index'
import { useDispatch } from 'react-redux'
import {setAuth} from '../../store/authSlice'
import { useSelector } from 'react-redux';

const Navbar = () => {
    const brandStyle = {
        color: '#fff',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
    };

    const logoText = {
        marginLeft: '10px',
    };

    const dispatch = useDispatch()
    const {isAuth, user} = useSelector(state => state.authSlice)


    async function logoutUser() {
        try {
            const { data } = await logout()
            dispatch(setAuth(data))
        } catch(err) {
            console.log(err)
        }
    }

    return (
        <nav className={`${styles.navbar} container`}>
            <Link style={brandStyle} to="/">
                <img src="/images/logo.png" alt="logo" style={{height: "20px"}}/>
                <span style={logoText}>Codershouse</span>
            </Link>
            {isAuth && (
                <div className={styles.navRight}>
                    <h4>{user?.name}</h4>
                    <Link to="/">
                        <img
                            className={styles.avatar}
                            src={ user.avatar ? user.avatar : '/images/monkey-avatar.png' }
                            width="30"
                            height="30"
                            alt="avatar"
                        />
                    </Link>
                    <button className={styles.logoutButton} onClick={logoutUser}>
                        <img src="/images/logout.svg" alt="logout" width="30" height="30"/>
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;