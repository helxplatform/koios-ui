export function findDbGaPIds(text) {
    // Regular expressions for matching the two types of IDs
    const phsRegex = /phs\d+/g;  // Matches (phs followed by one or more digits)
    const phvRegex = /phv\d+/g;  // Matches (phv followed by one or more digits)

    // Find all matches in the input text
    const phsMatches = text.match(phsRegex) || [];
    const phvMatches = text.match(phvRegex) || [];
        
    // Function to get unique elements from an array
    const getUnique = (arr) => {
        return arr.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });
    };

    const uniquePhsMatches = getUnique(phsMatches);
    const uniquePhvMatches = getUnique(phvMatches);

    return {
        phs: uniquePhsMatches,
        phv: uniquePhvMatches
    };
}