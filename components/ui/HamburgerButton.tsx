'use client';

interface HamburgerButtonProps {
    isOpen: boolean;
    onClick: () => void;
}

export default function HamburgerButton({ isOpen, onClick }: HamburgerButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 touch-target shadow-sm hover:shadow-md"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
        >
            {/* Animated Hamburger Icon */}
            <div className="relative w-6 h-5 flex flex-col justify-center items-center">
                <span
                    className={`absolute w-6 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 rounded-full transition-all duration-300 ease-in-out ${isOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'
                        }`}
                />
                <span
                    className={`absolute w-6 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 rounded-full transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                        }`}
                />
                <span
                    className={`absolute w-6 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 rounded-full transition-all duration-300 ease-in-out ${isOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'
                        }`}
                />
            </div>
        </button>
    );
}
