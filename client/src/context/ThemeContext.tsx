import  { createContext, useContext, useState } from 'react'

interface ThemeContext {
    themeName: string;
    style: any;
    setTheme: (newThemeName: string, newStyle: any) => void;
}
export const ThemeContext =createContext< ThemeContext | undefined>(undefined); 

export const ThemeProvider = ({ children }: { children: React.ReactNode })=>{
    const [themeName, setThemeName] = useState("DefaultTheme") ;
    // ⚠️ 这里的硬编码值属于「主题四套来源」里的来源 b，TODO #25 会改成
    // 「DB 值 + 兜底」并改用 CSS 变量注入（方案见 PRD D14 / CONVENTIONS 六）。
    // 本次只同步了资源改名后的新路径，没有改结构。
    const [style, setStyle] = useState({backgroundImage:"url('/themes/yume2kki/background-pink-haze.png')", imageRendering: "pixelated", borderStyle: "solid",borderWidth: "16px", borderImage: "url('/themes/yume2kki/border-purple-flowers.png') 10 repeat" , quitImage: "/themes/yume2kki/close-button-red-cross.png", modalHeaderColor: '#553d66'
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
