const express = require('express');
const router = express.Router();
const db = require('../services/db');

// Search endpoint that handles multiple types of searches
router.get('/', async function(req, res, next) {
  try {
    const searchQuery = req.query.q || '';
    const searchType = req.query.type || 'all'; // Options: 'all', 'professors', 'courses', 'universities'
    
    // If no search query provided, return empty results
    if (!searchQuery.trim()) {
      return res.json({ data: [], meta: { count: 0 } });
    }
    
    let results = [];
    
    // Search based on type
    if (searchType === 'all' || searchType === 'professors') {
      const professorResults = await searchProfessors(searchQuery);
      results.push(...professorResults.map(p => ({ ...p, type: 'professor' })));
    }
    
    if (searchType === 'all' || searchType === 'courses') {
      const courseResults = await searchCourses(searchQuery);
      results.push(...courseResults.map(c => ({ ...c, type: 'course' })));
    }
    
    if (searchType === 'all' || searchType === 'universities') {
      const uniResults = await searchUniversities(searchQuery);
      results.push(...uniResults.map(u => ({ ...u, type: 'university' })));
    }
    
    // Sort results by relevance (you can implement a more sophisticated ranking)
    results.sort((a, b) => (b.numeroCalificaciones || 0) - (a.numeroCalificaciones || 0));
    
    return res.json({ 
      data: results, 
      meta: { 
        count: results.length,
        query: searchQuery,
        type: searchType
      } 
    });
    
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'An error occurred while searching' });
  }
});

// Helper function to search professors
async function searchProfessors(query) {
  console.log("Executing query:", `SELECT id, nombre, apellido, universidad, promedioCalificaciones, numeroCalificaciones 
     FROM profesores
     WHERE nombre ILIKE $1 OR apellido ILIKE $1 OR universidad ILIKE $1
     ORDER BY numeroCalificaciones DESC
     LIMIT 10`);
  console.log("Query parameters:", [`%${query}%`]);
  
  const result = await db.query(
    `SELECT id, nombre, apellido, universidad, promedioCalificaciones, numeroCalificaciones 
     FROM profesores
     WHERE nombre ILIKE $1 OR apellido ILIKE $1 OR universidad ILIKE $1
     ORDER BY numeroCalificaciones DESC
     LIMIT 10`,
    [`%${query}%`]
  );
  
  return result.rows || []; // Return the rows array, not the entire result object
}

// Helper function to search courses (materias)
async function searchCourses(query) {
  console.log("Executing query:", `SELECT id, nombre_materia, codigo_materia, plan_de_estudios, universidad, 
            promedioCalificaciones, numeroCalificaciones
     FROM materias
     WHERE nombre_materia ILIKE $1 OR codigo_materia ILIKE $1 OR plan_de_estudios ILIKE $1 OR universidad ILIKE $1
     ORDER BY numeroCalificaciones DESC
     LIMIT 10`);
  console.log("Query parameters:", [`%${query}%`]);
  
  const result = await db.query(
    `SELECT id, nombre_materia, codigo_materia, plan_de_estudios, universidad, 
            promedioCalificaciones, numeroCalificaciones
     FROM materias
     WHERE nombre_materia ILIKE $1 OR codigo_materia ILIKE $1 OR plan_de_estudios ILIKE $1 OR universidad ILIKE $1
     ORDER BY numeroCalificaciones DESC
     LIMIT 10`,
    [`%${query}%`]
  );
  
  return result.rows || []; // Return the rows array, not the entire result object
}

// Helper function to search universities (unique values from profesor and materias)
async function searchUniversities(query) {
  const result = await db.query(
    `SELECT DISTINCT universidad, 
            (SELECT COUNT(*) FROM profesores WHERE universidad = p.universidad) as profesores_count,
            (SELECT COUNT(*) FROM materias WHERE universidad = p.universidad) as materias_count
     FROM profesores p
     WHERE universidad ILIKE $1
     UNION
     SELECT DISTINCT universidad, 
            (SELECT COUNT(*) FROM profesores WHERE universidad = m.universidad) as profesores_count,
            (SELECT COUNT(*) FROM materias WHERE universidad = m.universidad) as materias_count
     FROM materias m
     WHERE universidad ILIKE $1
     LIMIT 10`,
    [`%${query}%`]
  );
  
  return result.rows || []; // Return the rows array, not the entire result object
}

module.exports = router;