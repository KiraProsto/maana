'use client';

import { useEffect, useState } from 'react';
import styles from './ToTopButton.module.css';

export default function ToTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > 600);
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      className={`${styles.toTop} ${show ? styles.show : styles.hide}`}
      onClick={scrollToTop}
      aria-label="Прокрутить страницу наверх"
      type="button">
      ↑
    </button>
  );
}
