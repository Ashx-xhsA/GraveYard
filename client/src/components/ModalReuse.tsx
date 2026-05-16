import React, { useEffect } from "react";

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


    if (!open) return null;

    return (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] bg-white p-6 rounded-lg shadow-xl text-black min-w-[300px]">
            <button 
                onClick={closeModal}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 transition-colors p-1"
                aria-label="Close modal"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            
            {content}
        </div>
    );
}