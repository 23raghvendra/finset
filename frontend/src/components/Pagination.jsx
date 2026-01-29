import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  showItemsInfo = true,
  showQuickJump = true
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between py-4">
      {/* Items info */}
      {showItemsInfo && (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Showing <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{startItem}</span> to{' '}
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{endItem}</span> of{' '}
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{totalItems}</span> results
        </p>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* First page */}
        {showQuickJump && (
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: 'var(--text-muted)' }}
            onMouseOver={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'var(--hover-bg)')}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ChevronsLeft size={16} />
          </button>
        )}

        {/* Previous page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-9 h-9 flex items-center justify-center rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: 'var(--text-muted)' }}
          onMouseOver={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'var(--hover-bg)')}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 mx-2">
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="w-9 h-9 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all"
                style={{
                  background: currentPage === page ? 'var(--primary-600)' : 'transparent',
                  color: currentPage === page ? 'white' : 'var(--text-secondary)'
                }}
                onMouseOver={(e) => {
                  if (currentPage !== page) {
                    e.currentTarget.style.background = 'var(--hover-bg)';
                  }
                }}
                onMouseOut={(e) => {
                  if (currentPage !== page) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* Next page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-9 h-9 flex items-center justify-center rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: 'var(--text-muted)' }}
          onMouseOver={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'var(--hover-bg)')}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <ChevronRight size={16} />
        </button>

        {/* Last page */}
        {showQuickJump && (
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: 'var(--text-muted)' }}
            onMouseOver={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'var(--hover-bg)')}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ChevronsRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

// Hook for pagination logic
export const usePagination = (items, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when items change significantly
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems,
    totalItems: items.length,
    itemsPerPage
  };
};

export default Pagination;
