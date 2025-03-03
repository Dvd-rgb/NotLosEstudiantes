document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.querySelector('.search-box');
    const searchInput = document.querySelector('.search-box input');
    const searchButton = document.querySelector('.search-box button');
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'search-results';
    
    // Insert results container after the search box
    searchForm.parentNode.insertBefore(resultsContainer, searchForm.nextSibling);
    
    // Add search type tabs and insert after search box
    const searchTypesHTML = `
      <div class="search-types">
        <button class="search-type-btn active" data-type="all">Todo</button>
        <button class="search-type-btn" data-type="professors">Profesores</button>
        <button class="search-type-btn" data-type="courses">Materias</button>
        <button class="search-type-btn" data-type="universities">Universidades</button>
      </div>
    `;
    
    const searchTypesContainer = document.createElement('div');
    searchTypesContainer.innerHTML = searchTypesHTML;
    searchForm.parentNode.insertBefore(searchTypesContainer.firstElementChild, searchForm.nextSibling);
    
    // Track current search type
    let currentSearchType = 'all';
    
    // Add event listeners to search type buttons
    const searchTypeButtons = document.querySelectorAll('.search-type-btn');
    searchTypeButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Remove active class from all buttons
        searchTypeButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        this.classList.add('active');
        // Update current search type
        currentSearchType = this.dataset.type;
        
        // If there's text in the search box, perform a new search
        if (searchInput.value.trim()) {
          performSearch(searchInput.value.trim());
        }
      });
    });
    
    // Hide results initially
    resultsContainer.style.display = 'none';
    
    // Handle search form submission
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const query = searchInput.value.trim();
      
      if (!query) {
        return;
      }
      
      performSearch(query);
    });
    
    function performSearch(query) {
      // Show loading state
      searchButton.textContent = 'Buscando...';
      searchButton.disabled = true;
      
      // Make API request
      fetch(`/api/search?q=${encodeURIComponent(query)}&type=${currentSearchType}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Search failed');
          }
          return response.json();
        })
        .then(data => {
          displayResults(data);
        })
        .catch(error => {
          console.error('Error:', error);
          resultsContainer.innerHTML = `
            <div class="error-message">
              <p>Lo sentimos, algo salió mal con tu búsqueda. Por favor, inténtalo de nuevo más tarde.</p>
            </div>
          `;
          resultsContainer.style.display = 'block';
        })
        .finally(() => {
          // Reset button state
          searchButton.textContent = 'Buscar';
          searchButton.disabled = false;
        });
    }
    
    function displayResults(data) {
      if (data.data.length === 0) {
        resultsContainer.innerHTML = `
          <div class="no-results">
            <p>No se encontraron resultados para "${data.meta.query}". Intenta con otro término de búsqueda.</p>
          </div>
        `;
      } else {
        let resultsHTML = `
          <h2>${data.meta.count} resultado${data.meta.count !== 1 ? 's' : ''} encontrado${data.meta.count !== 1 ? 's' : ''}</h2>
          <div class="search-results-grid">
        `;
        
        // Group results by type
        const groupedResults = {
          professor: data.data.filter(item => item.type === 'professor'),
          course: data.data.filter(item => item.type === 'course'),
          university: data.data.filter(item => item.type === 'university')
        };
        
        // Display professors
        if (groupedResults.professor.length > 0) {
          resultsHTML += `<h3 class="result-type-heading">Profesores</h3>`;
          resultsHTML += `<div class="result-cards professor-cards">`;
          
          groupedResults.professor.forEach(professor => {
            const fullName = `${professor.nombre} ${professor.apellido}`;
            const rating = professor.promediocalificaciones || 0;
            const stars = generateStars(rating);
            
            resultsHTML += `
              <div class="result-card">
                <img src="/api/placeholder/300/200" alt="Profesor" class="result-img">
                <div class="result-info">
                  <h4>${fullName}</h4>
                  <div class="rating">
                    <div class="stars">${stars}</div>
                    <span>${rating}</span>
                  </div>
                  <p class="university">${professor.universidad}</p>
                  <p class="reviews">${professor.numerocalificaciones || 0} calificacion${professor.numerocalificaciones !== 1 ? 'es' : ''}</p>
                  <a href="/profesores/${professor.id}" class="btn btn-primary">Ver Perfil</a>
                </div>
              </div>
            `;
          });
          
          resultsHTML += `</div>`;
        }
        
        // Display courses
        if (groupedResults.course.length > 0) {
          resultsHTML += `<h3 class="result-type-heading">Materias</h3>`;
          resultsHTML += `<div class="result-cards course-cards">`;
          
          groupedResults.course.forEach(course => {
            const rating = course.promediocalificaciones || 0;
            const stars = generateStars(rating);
            
            resultsHTML += `
              <div class="result-card">
                <div class="result-info">
                  <h4>${course.nombre_materia}</h4>
                  <p class="course-code">${course.codigo_materia}</p>
                  <div class="rating">
                    <div class="stars">${stars}</div>
                    <span>${rating}</span>
                  </div>
                  <p class="program">${course.plan_de_estudios}</p>
                  <p class="university">${course.universidad}</p>
                  <p class="reviews">${course.numerocalificaciones || 0} calificacion${course.numerocalificaciones !== 1 ? 'es' : ''}</p>
                  <a href="/materias/${course.id}" class="btn btn-primary">Ver Detalles</a>
                </div>
              </div>
            `;
          });
          
          resultsHTML += `</div>`;
        }
        
        // Display universities
        if (groupedResults.university.length > 0) {
          resultsHTML += `<h3 class="result-type-heading">Universidades</h3>`;
          resultsHTML += `<div class="result-cards university-cards">`;
          
          groupedResults.university.forEach(uni => {
            resultsHTML += `
              <div class="result-card university-card">
                <div class="result-info">
                  <h4>${uni.universidad}</h4>
                  <p class="uni-stats">
                    <span>${uni.profesores_count} profesor${uni.profesores_count !== 1 ? 'es' : ''}</span> | 
                    <span>${uni.materias_count} materia${uni.materias_count !== 1 ? 's' : ''}</span>
                  </p>
                  <a href="/universidades/${encodeURIComponent(uni.universidad)}" class="btn btn-primary">Ver Universidad</a>
                </div>
              </div>
            `;
          });
          
          resultsHTML += `</div>`;
        }
        
        resultsHTML += `</div>`; // Close search-results-grid
        resultsContainer.innerHTML = resultsHTML;
      }
      
      // Show results
      resultsContainer.style.display = 'block';
      
      // Scroll to results
      resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    function generateStars(rating) {
      const normalizedRating = Math.min(5, Math.max(0, rating));
      const fullStars = Math.floor(normalizedRating);
      const halfStar = normalizedRating % 1 >= 0.5;
      const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
      
      let stars = '';
      for (let i = 0; i < fullStars; i++) {
        stars += '★';
      }
      if (halfStar) {
        stars += '☆'; // Using empty star as half star for simplicity
      }
      for (let i = 0; i < emptyStars; i++) {
        stars += '☆';
      }
      
      return stars;
    }
  });