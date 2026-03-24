import "./tableSkeleton.css"; 

function TableSkeleton({ rows = 5, columns = 7 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="px-6 py-4">
              <div className="h-4 w-full max-w-[150px] rounded skeleton"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default TableSkeleton;