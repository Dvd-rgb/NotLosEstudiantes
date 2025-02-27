document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.querySelector('.search-box');
    const searchInput = document.querySelector('.search-box input');
    const searchButton = document.querySelector('.search-box button');
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'search-results';
    
    // Insert results container after the search box
    searchForm.parentNode.insertBefore(resultsContainer, searchForm.nextSibling);
    
    // Hide results initially
    resultsContainer.style.display = 'none';
    
    // Handle search form submission
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const query = searchInput.value.trim();
      
      if (!query) {
        return;
      }
      
      // Show loading state
      searchButton.textContent = 'Searching...';
      searchButton.disabled = true;
      
      // Make API request
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
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
              <p>Sorry, something went wrong with your search. Please try again later.</p>
            </div>
          `;
          resultsContainer.style.display = 'block';
        })
        .finally(() => {
          // Reset button state
          searchButton.textContent = 'Search';
          searchButton.disabled = false;
        });
    });
    
    function displayResults(data) {
      if (data.data.length === 0) {
        resultsContainer.innerHTML = `
          <div class="no-results">
            <p>No professors found matching "${data.meta.query}". Try a different search term.</p>
          </div>
        `;
      } else {
        // Create result cards
        let resultsHTML = `
          <h2>${data.meta.count} Professor${data.meta.count !== 1 ? 's' : ''} Found</h2>
          <div class="professor-search-cards">
        `;
        
        data.data.forEach(professor => {
          const stars = generateStars(professor.average_rating);
          
          resultsHTML += `
            <div class="professor-card">
              <img src="/api/placeholder/300/200" alt="Professor" class="professor-img">
              <div class="professor-info">
                <h3>${professor.name}</h3>
                <div class="rating">
                  <div class="stars">${stars}</div>
                  <span>${professor.average_rating.toFixed(1)}</span>
                </div>
                <p class="subject">${professor.department}</p>
                <p class="school">${professor.school_name}</p>
                <p class="reviews">${professor.review_count} review${professor.review_count !== 1 ? 's' : ''}</p>
                <a href="/professors/${professor.id}" class="btn btn-primary">View Profile</a>
              </div>
            </div>
          `;
        });
        
        resultsHTML += `</div>`;
        resultsContainer.innerHTML = resultsHTML;
      }
      
      // Show results
      resultsContainer.style.display = 'block';
      
      // Scroll to results
      resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    function generateStars(rating) {
      const fullStars = Math.floor(rating);
      const halfStar = rating % 1 >= 0.5;
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