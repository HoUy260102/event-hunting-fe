export function extractSeatData(content) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "image/svg+xml");
    const seatGroups = doc.querySelectorAll('g[id^="seat-"]');
    
    const seats = Array.from(seatGroups).map(group => {
        const fullId = group.id; 
        const parts = fullId.split('-');
        return {
            seatCode: fullId,
            rowName: parts[2].toUpperCase(), 
            seatNumber: parts[3],             
        };
    });
    return seats;
}