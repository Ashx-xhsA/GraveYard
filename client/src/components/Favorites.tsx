import type { FavoriteRef } from '../types';

const Favorites = ({ favorites }: { favorites: FavoriteRef[] }) => {
  console.log(favorites);
  return (
    <div id="favorites">
      <div className="favorites-title">Favorite Places</div>
      <div className="favorites-list">
        {favorites.map((grave) => (
          <div className="favorite-item" key={grave._id}>
            {grave.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;
