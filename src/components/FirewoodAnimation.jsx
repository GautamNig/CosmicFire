// src/components/FirewoodAnimation.jsx - FIXED VERSION
import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import { AppSettings } from '../config/settings';

export default function FirewoodAnimation() {
  const animationContainer = useRef(null);

  useEffect(() => {
    let anim;
    if (animationContainer.current) {
      anim = lottie.loadAnimation({
        container: animationContainer.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/lottie/Firewood.json'
      });
    }

    return () => {
      if (anim) {
        anim.destroy();
      }
    };
  }, []);

  return (
    <div 
      className="firewood-animation"
      style={{
        width: `${AppSettings.FIREWOOD.SIZE}px`,
        height: `${AppSettings.FIREWOOD.SIZE}px`
      }}
    >
      <div ref={animationContainer} className="lottie-container" />
    </div>
  );
}