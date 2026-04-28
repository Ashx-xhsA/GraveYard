const Favorites = ({ favorites }: { favorites: any }) => {
  console.log(favorites);
  return (
    <div id="favorites">
      <div className="favorites-title">Favorite Places</div>
      <div className="favorites-list">
        {favorites.map((graveId: any) => (
          <div className="favorite-item" key={graveId}>
            {graveId}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;
