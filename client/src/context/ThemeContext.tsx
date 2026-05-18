import  { createContext, useContext, useState } from 'react'

interface ThemeContext {
    themeName: string;
    style: any;
    setTheme: (newThemeName: string, newStyle: any) => void;
}
export const ThemeContext =createContext< ThemeContext | undefined>(undefined); 

export const ThemeProvider = ({ children }: { children: React.ReactNode })=>{
    const [themeName, setThemeName] = useState("DefaultTheme") ;
    const [style, setStyle] = useState({backgroundImage:"url('/themes/containerbg.png')", imageRendering: "pixelated", borderStyle: "solid",borderWidth: "16px", borderImage: "url('/themes/border.png') 10 repeat" , quitImage: "/themes/quit.png"
});

    const setTheme = (newThemeName: string, newStyle: any)=>{
        setThemeName(newThemeName);
        setStyle(newStyle);
    }

    return <ThemeContext.Provider value={{ themeName, setTheme, style }}>
        
          {children}
          
        </ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
