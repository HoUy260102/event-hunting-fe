import React, { useEffect, useState } from "react";
import TicketItem from "./TicketTypeItem";

function TicketTypeSelector({ ticketTypes, onSelectTicket, activeTypeId }) {
  const [activeId, setActiveId] = useState();
  const handleToggle = (id, type) => {
    setActiveId(activeId === id ? null : id);
    if (onSelectTicket) {
      onSelectTicket(type?.sectionId);
    }
  };

  useEffect(() => {
    setActiveId(activeTypeId);
  }, [activeTypeId]);
  
  const noScrollbarStyles = `
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `;
  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <style>{noScrollbarStyles}</style>
      <h3 className="text-lg font-bold mb-4">Loại vé có sẵn</h3>
      <div className="no-scrollbar space-y-3 overflow-y-auto max-h-[300px]">
        {ticketTypes?.map((type) => (
          <TicketItem
            key={type.id}
            type={type}
            isOpen={activeId === type.id}
            onToggle={() => handleToggle(type.id, type)}
          />
        ))}
      </div>
    </div>
  );
}

export default TicketTypeSelector;
