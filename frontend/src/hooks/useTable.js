import { useState, useMemo } from 'react';

export function useTable(data, initialOptions = {}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(initialOptions.filters || {});
  const [sortConfig, setSortConfig] = useState(initialOptions.sort || null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialOptions.pageSize || 8);

  const setFilter = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (value === 'All' || value === '') {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      return newFilters;
    });
    setCurrentPage(1); 
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // 1. Search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(item => 
        Object.values(item).some(val => 
          String(val).toLowerCase().includes(lowerSearch)
        )
      );
    }

    // 2. Filter
    if (Object.keys(filters).length > 0) {
      result = result.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
          if (value === 'All') return true;
          return String(item[key]).toLowerCase() === String(value).toLowerCase();
        });
      });
    }

    // 3. Sort
    if (sortConfig) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        
        if (typeof valA === 'string' && typeof valB === 'string') {
          const numA = Number(valA.replace(/[^0-9.-]+/g,""));
          const numB = Number(valB.replace(/[^0-9.-]+/g,""));
          if (!isNaN(numA) && !isNaN(numB) && valA.match(/[0-9]/)) {
            valA = numA;
            valB = numB;
          }
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, filters, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize) || 1;
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };


  return {
    filteredData: filteredAndSortedData,
    paginatedData,
    searchTerm,
    setSearchTerm: (term) => { setSearchTerm(term); setCurrentPage(1); },
    filters,
    setFilter,
    sortConfig,
    handleSort,
    currentPage,
    totalPages,
    goToPage,
    pageSize,
    setPageSize,
    totalCount: data.length,
    filteredCount: filteredAndSortedData.length
  };
}
