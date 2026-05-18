import React, { useEffect } from "react";
import { useTheme } from "../context/ThemeContext";


interface Props {
    open: boolean;
    closeModal?: () => void;
    content?: React.ReactNode;
}

export const ModalReuse : React.FC<Props> = (props) => {
    const {open, closeModal, content} = props; 
    // simple useEffect to capture ESC key to close the modal 
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) {
                if (closeModal) {
                    closeModal();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, closeModal]);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);


    if (!open) return null;
    const {style} = useTheme();

    return (
        <div 
            className="fixed inset-0 z-[100] bg-black/30 flex items-center justify-center"
            onClick={closeModal}
        >
            <div 
                className="relative p-6  min-w-[300px]" 
                style={style}
                onClick={(e) => e.stopPropagation()} 
            >
                <button 
                    onClick={closeModal}
                    className="absolute -top-2 -right-2 hover:scale-150 active:scale-95 transition-transform "
                    aria-label="Close modal"
                >
                    <img src={style?.quitImage || "/quit.PNG"} alt="Close" className="h-6 w-6 object-contain" style={{ imageRendering: 'pixelated' }} />
                </button>
                
                {content}
            </div>
        </div>
    );
}