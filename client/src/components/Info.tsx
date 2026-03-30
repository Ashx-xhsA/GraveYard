const Info = ({ user }: { user: any }) => {
  return (
    <div id="info">
      <p>Name: {user.username}</p>
      <p>Graves Created: {user.gravesCreated ?? 0}</p>
      <p>Interactions: {user.interactionsMade ?? 0}</p>
    </div>
  );
};

export default Info;