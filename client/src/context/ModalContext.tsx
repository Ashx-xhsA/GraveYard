import { createContext, useContext, useState } from "react";
import { ModalReuse } from "../components/ModalReuse";


interface ModalContext {
    open: boolean;
    closeModal: () => void;
    openModal: (content: React.ReactNode) => void;
}

export const ModalContext = createContext< ModalContext | undefined>(undefined); 

export const ModalProvider =({ children }: { children: React.ReactNode })=>{
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState<React.ReactNode>(null);

    const closeModal=()=>{setOpen(false)}
    const openModal = (newContent: React.ReactNode) => {
        setContent(newContent);
        setOpen(true);
    };

    return <ModalContext.Provider value={{ open, openModal, closeModal }}>
    
      {children}
      {open && (
                <ModalReuse open={open} closeModal={closeModal} content={content} /> 
            )}
    </ModalContext.Provider>
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within an ModalProvider');
  }
  return context;
};