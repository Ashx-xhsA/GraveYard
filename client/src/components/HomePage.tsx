import { Link } from 'react-router-dom';

interface Block {
  blockID: string;
  name: string;
  blockIconImage: string;
  description: string;
}

interface HomePageProps {
  blocks: Block[];
}

const HomePage = ({ blocks }: HomePageProps) => {
  // 如果還沒拿到資料，顯示一下載入中
  if (!blocks || blocks.length === 0) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <span className="text-white font-pixel text-xl">快到了...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto p-8 scrollbar-hide">
      
      {/* 網格設定：手機/小螢幕 3 欄，大螢幕 (lg) 4 欄 */}
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 pb-20">
        {blocks.map((block) => (
          <Link 
            key={block.blockID} 
            to={`/${block.blockID}`}
            className="flex flex-col items-center justify-start cursor-pointer transition-transform hover:scale-110"
          >
            {/* 墓園 Icon (加入預設防呆) */}
            <img 
              src={block.blockIconImage || '/themes/unknownplace.webp'} 
              alt={block.name}
              className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-md"
            />
            {/* 墓園名稱 */}
            <span className="text-white font-pixel mt-4 text-center text-sm sm:text-base">
              {block.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
