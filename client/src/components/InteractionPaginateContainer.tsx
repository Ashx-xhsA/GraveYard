import ReactPaginate from 'react-paginate';
import { useState } from 'react';
import type { GraveDetail, InteractionRecord } from '../types';

type GraveInteraction = GraveDetail['interaction'];

const displayName = (user: InteractionRecord['user']) => user?.username ?? '[deleted user]';

const TotalCount = ({interaction, name}: {interaction: GraveInteraction, name: string}) => {
  return (
    <div className='interaction-stats'>
      <h3>{name} received <span >{interaction.stats.totalOfferings}</span> offerings</h3>
      <h3>{name} received <span>{interaction.stats.totalMessages}</span> messages</h3>
    </div>
  )
}

const Items = ({currentItems}: {currentItems: InteractionRecord[]}) => {
  const formatDate = (timestamp: string) => {
    if (!timestamp) return 'Invalid Date';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  return (
    <div className='interaction-items'>
      {currentItems &&
        currentItems.map((item) => (
          <div key={item._id} className='interaction-item'>
            {item.type === 'item' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>{displayName(item.user)} left {item.quantity} {item.itemName} here.</h3>
                <p style={{ margin: 0, whiteSpace: 'nowrap', paddingLeft: '10px' }}>{formatDate(item.createdAt)}</p>
              </div>
            )}
            {item.type === 'message' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>{displayName(item.user)} said: "{item.content}"</h3>
                <p style={{ margin: 0, whiteSpace: 'nowrap', paddingLeft: '10px' }}>{formatDate(item.createdAt)}</p>
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
const InteractionPaginateContainer = ({interaction, itemsPerPage, name}: {interaction: GraveInteraction, itemsPerPage: number, name: string}) => {
    const [itemOffset, setItemOffset] = useState(0);
    const endOffset = itemOffset + itemsPerPage;
    const currentItems = interaction.history.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(interaction.history.length / itemsPerPage);
    const handlePageClick = (event: { selected: number }) => {
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