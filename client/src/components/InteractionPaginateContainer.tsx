import ReactPaginate from 'react-paginate';
import { useState } from 'react';
const TotalCount = ({interaction, name}: {interaction: any, name: string}) => {
  return (
    <div className='interaction-stats'>
      <h3>{name} recieved <span >{interaction.stats.totalFlowers}</span> flowers</h3>
      <h3>{name} recieved <span>{interaction.stats.totalMessages}</span> messages</h3>
    </div>
  )
}

const Items = ({currentItems}: {currentItems: any}) => {
  const formatDate = (timestamp: any) => {
    const date = new Date(Number(timestamp) * 1000);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  return (
    <div className='interaction-items'>
      {currentItems &&
        currentItems.map((item: any) => (
          <div key={item._id || item.id} className='interaction-item'>
            {item.type === 'flower' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>{item.user} left {item.quantity} {item.variety} here.</h3>
                <p style={{ margin: 0, whiteSpace: 'nowrap', paddingLeft: '10px' }}>{formatDate(item.timestamp)}</p>
              </div>
            )}
            {item.type === 'message' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>{item.user} said: "{item.content}"</h3>
                <p style={{ margin: 0, whiteSpace: 'nowrap', paddingLeft: '10px' }}>{formatDate(item.timestamp)}</p>
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
const InteractionPaginateContainer = ({interaction, itemsPerPage, name}: {interaction: any, itemsPerPage: number, name: string}) => {
    const [itemOffset, setItemOffset] = useState(0);
    const endOffset = itemOffset + itemsPerPage;
    const currentItems = interaction.history.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(interaction.history.length / itemsPerPage);
    const handlePageClick = (event: any) => {
        const newOffset = (event.selected * itemsPerPage) % interaction.history.length;
        setItemOffset(newOffset);
    }
  return (
    <div className='interaction-paginate-container'>
    <TotalCount interaction={interaction} name={name} />
    <Items currentItems={currentItems} />
    <ReactPaginate
        className="interaction-pagination"
        breakLabel="..."
        nextLabel="next >"
        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        pageCount={pageCount}
        previousLabel="< previous"
        renderOnZeroPageCount={null}
      />
    </div>
  )
}

export default InteractionPaginateContainer 