'use client';

import { useEffect, useState } from 'react';

export function useTouchRipple() {
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

    const createRipple = (event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
        const element = event.currentTarget;
        const rect = element.getBoundingClientRect();

        let x: number, y: number;

        if ('touches' in event && event.touches.length > 0) {
            x = event.touches[0].clientX - rect.left;
            y = event.touches[0].clientY - rect.top;
        } else if ('clientX' in event) {
            x = event.clientX - rect.left;
            y = event.clientY - rect.top;
        } else {
            return;
        }

        const ripple = {
            x,
            y,
            id: Date.now(),
        };

        setRipples((prev) => [...prev, ripple]);

        setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
        }, 600);
    };

    return { ripples, createRipple };
}

export function TouchRipple({ ripples }: { ripples: Array<{ x: number; y: number; id: number }> }) {
    return (
        <>
            {ripples.map((ripple) => (
                <span
                    key={ripple.id}
                    className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        width: 0,
                        height: 0,
                    }}
                />
            ))}
        </>
    );
}
