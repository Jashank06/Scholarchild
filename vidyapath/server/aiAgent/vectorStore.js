/**
 * 🗄️ Vector Store & RAG Engine
 * Uses OpenAI Embeddings and MongoDB Atlas Vector Search
 * to perform semantic extraction and duplicate detection.
 */

const { OpenAI } = require('openai');
const mongoose = require('mongoose');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate a 1536-dimensional vector for a given text
 */
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.replace(/\n/g, ' '),
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('❌ Embedding generation failed:', error.message);
    return null;
  }
}

/**
 * RAG Extraction: Retrieve most relevant chunks from a huge document
 * before sending to LLM to save tokens and improve accuracy.
 */
async function retrieveRelevantChunks(fullText, query, topK = 3) {
  // 1. Chunk the document (naive split by paragraphs)
  const chunks = fullText.split('\n\n').filter(c => c.trim().length > 50);
  
  // 2. Generate embedding for query
  const queryEmbedding = await generateEmbedding(query);
  if (!queryEmbedding) return chunks.slice(0, topK).join('\n\n'); // fallback

  // 3. Generate embeddings for chunks (in parallel)
  const chunkEmbeddings = await Promise.all(
    chunks.map(async (chunk) => ({
      text: chunk,
      embedding: await generateEmbedding(chunk)
    }))
  );

  // 4. Calculate cosine similarity
  const cosineSimilarity = (vecA, vecB) => {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  };

  // 5. Rank and return top K
  const ranked = chunkEmbeddings
    .filter(c => c.embedding)
    .map(c => ({
      text: c.text,
      score: cosineSimilarity(queryEmbedding, c.embedding)
    }))
    .sort((a, b) => b.score - a.score);

  return ranked.slice(0, topK).map(r => r.text).join('\n\n');
}

/**
 * Semantic Duplicate Detection using MongoDB Atlas Vector Search
 * Assumes the AgentOpportunity schema has an `embedding` field and vector index.
 */
async function findSemanticDuplicates(embedding, threshold = 0.92) {
  const AgentOpportunity = mongoose.model('AgentOpportunity');
  
  try {
    // Requires Atlas Vector Search Index named "vector_index"
    const duplicates = await AgentOpportunity.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: embedding,
          numCandidates: 10,
          limit: 3
        }
      },
      {
        $project: {
          title: 1,
          score: { $meta: 'vectorSearchScore' }
        }
      },
      {
        $match: { score: { $gte: threshold } }
      }
    ]);
    
    return duplicates;
  } catch (error) {
    // Silently fail if Atlas Vector Search is not configured
    return [];
  }
}

module.exports = {
  generateEmbedding,
  retrieveRelevantChunks,
  findSemanticDuplicates
};
