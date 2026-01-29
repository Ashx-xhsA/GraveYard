import React from 'react';

const Info = ({ user }: { user: any }) => {
    console.log(user);
  return (
    <div id="info">
      <p>Name: {user.username}</p>
      <p>Graves Created: {user.gravesCreated}</p>
      <p>Flowers Balance: {user.flowersBalance}</p>
    </div>
  );
};

export default Info;