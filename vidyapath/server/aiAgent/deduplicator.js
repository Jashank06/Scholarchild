/**
 * 🔁 AI Duplicate Detector
 * Detects duplicate opportunities using fuzzy matching.
 */

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshtein(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b[i - 1] === a[j - 1]
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Token-based similarity (Jaccard)
 */
function tokenSimilarity(a, b) {
  const tokensA = new Set((a || '').toLowerCase().split(/\s+/).filter(t => t.length > 2));
  const tokensB = new Set((b || '').toLowerCase().split(/\s+/).filter(t => t.length > 2));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  const intersection = [...tokensA].filter(t => tokensB.has(t)).length;
  const union = new Set([...tokensA, ...tokensB]).size;
  return union > 0 ? intersection / union : 0;
}

/**
 * Normalized string similarity (1 - normalized Levenshtein)
 */
function stringSimilarity(a, b) {
  if (!a || !b) return 0;
  const la = a.toLowerCase().trim();
  const lb = b.toLowerCase().trim();
  if (la === lb) return 1;
  const maxLen = Math.max(la.length, lb.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(la, lb) / maxLen;
}

/**
 * Check for duplicates against existing opportunities
 * @param {object} newOpp - New opportunity to check
 * @param {Array} existingOpps - Array of existing opportunities
 * @param {number} threshold - Similarity threshold (0-1), default 0.75
 * @returns {object} { isDuplicate, similarityScore, matchedId, matchDetails }
 */
function checkDuplicate(newOpp, existingOpps, threshold = 0.75) {
  if (!existingOpps || existingOpps.length === 0) {
    return { isDuplicate: false, similarityScore: 0, matchedId: null, matchDetails: 'No existing entries to compare' };
  }

  const newTitle = (newOpp.title || '').toLowerCase().trim();
  let bestMatch = { score: 0, id: null, title: '' };

  for (const existing of existingOpps) {
    const existTitle = (existing.title || '').toLowerCase().trim();

    // 1. Exact title match → definite duplicate
    if (newTitle === existTitle) {
      return {
        isDuplicate: true,
        similarityScore: 100,
        matchedId: existing._id,
        matchDetails: `Exact title match: "${existing.title}"`,
      };
    }

    // 2. Combined similarity: title string + token similarity
    const titleStrSim = stringSimilarity(newTitle, existTitle);
    const titleTokenSim = tokenSimilarity(newTitle, existTitle);
    
    // Provider similarity
    const providerSim = stringSimilarity(
      newOpp.organizer?.name || '',
      existing.organizer?.name || ''
    );

    // Weighted score: title (60%) + tokens (25%) + provider (15%)
    const combinedScore = titleStrSim * 0.6 + titleTokenSim * 0.25 + providerSim * 0.15;

    if (combinedScore > bestMatch.score) {
      bestMatch = { score: combinedScore, id: existing._id, title: existing.title };
    }
  }

  const isDuplicate = bestMatch.score >= threshold;
  return {
    isDuplicate,
    similarityScore: Math.round(bestMatch.score * 100),
    matchedId: isDuplicate ? bestMatch.id : null,
    matchDetails: isDuplicate
      ? `Similar to "${bestMatch.title}" (${Math.round(bestMatch.score * 100)}% match)`
      : `Best match: "${bestMatch.title}" (${Math.round(bestMatch.score * 100)}% - below threshold)`,
  };
}

module.exports = { checkDuplicate, stringSimilarity, tokenSimilarity };
