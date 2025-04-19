import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Generate an array of page numbers to show
  const generatePageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Show at most 5 pages at a time
    
    if (totalPages <= maxPagesToShow) {
      // If we have fewer pages than maxPagesToShow, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include the first page
      pageNumbers.push(1);
      
      // Calculate start and end of the page range around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust for edge cases
      if (currentPage <= 2) {
        endPage = Math.min(4, totalPages - 1);
      } else if (currentPage >= totalPages - 1) {
        startPage = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always include the last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };
  
  const pageNumbers = generatePageNumbers();
  
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };
  
  return (
    <div className="flex items-center justify-center space-x-1 mt-4">
      {/* Previous button */}
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 rounded-md ${
          currentPage === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <i className="ti ti-chevron-left text-sm"></i>
      </button>
      
      {/* Page numbers */}
      {pageNumbers.map((number, idx) => (
        <button
          key={idx}
          onClick={() => typeof number === 'number' && goToPage(number)}
          disabled={number === '...'}
          className={`px-3 py-2 rounded-md ${
            number === currentPage
              ? 'bg-blue-600 text-white'
              : number === '...'
              ? 'text-gray-600 cursor-default'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {number}
        </button>
      ))}
      
      {/* Next button */}
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 rounded-md ${
          currentPage === totalPages
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <i className="ti ti-chevron-right text-sm"></i>
      </button>
    </div>
  );
};

export default Pagination;
