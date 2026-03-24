import React from 'react';
// 1. Import file GIF như một module
import emptyGif from '../../images/box.png';

function SearchEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-10 w-full text-center">
      <img 
        src={emptyGif} 
        alt="No results found" 
        className="w-64 h-auto opacity-80"
      />
      <p className="text-gray-400 mt-4">Không tìm thấy kết quả nào!</p>
    </div>
  );
}

export default SearchEmpty;