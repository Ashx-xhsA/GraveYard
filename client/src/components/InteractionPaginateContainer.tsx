import ReactPaginate from 'react-paginate';
import { useMemo, useState } from 'react';
import type { GraveDetail, InteractionRecord } from '../types';
import { itemLabel, useT } from '../i18n';
import type { Messages } from '../i18n';

type GraveInteraction = GraveDetail['interaction'];

const displayName = (t: Messages, user: InteractionRecord['user']) => user?.username ?? t.grave.deletedUser;

const TotalCount = ({ stats }: { stats: GraveInteraction['stats'] }) => {
  const t = useT();
  return (
    <div className='interaction-stats'>
      {stats.totalOfferings > 0 ? (
        <>
          <h3>{t.grave.thingsRestHere(stats.totalOfferings)}</h3>
          <p className='interaction-stats-breakdown'>
            {stats.byName.map(({ name, count }) => `${itemLabel(t, name)} × ${count}`).join(' · ')}
          </p>
        </>
      ) : (
        <h3>{t.grave.nothingYet}</h3>
      )}
      <h3>{t.grave.messageCount(stats.totalMessages)}</h3>
    </div>
  );
};

const Items = ({currentItems}: {currentItems: InteractionRecord[]}) => {
  const t = useT();
  const formatDate = (timestamp: string) => {
    if (!timestamp) return t.grave.invalidDate;
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return t.grave.invalidDate;
    }
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  return (
    <div className='interaction-items'>
      {currentItems &&
        currentItems.map((item) => (
          <div key={item._id} className='interaction-item'>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>
                {item.type === 'item'
                  ? t.grave.offered(displayName(t, item.user), item.quantity, itemLabel(t, item.itemName))
                  : t.grave.said(displayName(t, item.user), item.content)}
              </h3>
              <p style={{ margin: 0, whiteSpace: 'nowrap', paddingLeft: '10px' }}>{formatDate(item.createdAt)}</p>
            </div>
          </div>
        ))}
    </div>
  );
}

/**
 * Stats plus a paginated history, newest first so that something just left
 * shows up at the top of the first page.
 */
const InteractionPaginateContainer = ({interaction, itemsPerPage}: {interaction: GraveInteraction, itemsPerPage: number}) => {
    const t = useT();
    const history = useMemo(() => [...interaction.history].reverse(), [interaction.history]);
    const [itemOffset, setItemOffset] = useState(0);
    const endOffset = itemOffset + itemsPerPage;
    const currentItems = history.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(history.length / itemsPerPage);
    const handlePageClick = (event: { selected: number }) => {
        const newOffset = (event.selected * itemsPerPage) % history.length;
        setItemOffset(newOffset);
    }
  return (
    <div className='interaction-paginate-container'>
    <TotalCount stats={interaction.stats} />
    <Items currentItems={currentItems} />
    <ReactPaginate
        className="interaction-pagination"
        breakLabel="..."
        nextLabel={t.pagination.next}
        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        pageCount={pageCount}
        previousLabel={t.pagination.previous}
        renderOnZeroPageCount={null}
      />
    </div>
  )
}

export default InteractionPaginateContainer
