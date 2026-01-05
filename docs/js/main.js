// @oxog/kit Documentation JavaScript

document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const menuToggle = document.querySelector('.nav-menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Copy code blocks on click
  document.querySelectorAll('pre code').forEach(block => {
    block.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(block.textContent);

        // Show feedback
        const originalBg = block.parentElement.style.backgroundColor;
        block.parentElement.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
        setTimeout(() => {
          block.parentElement.style.backgroundColor = originalBg;
        }, 200);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    });

    // Add cursor pointer
    block.style.cursor = 'pointer';
    block.title = 'Click to copy';
  });

  // Highlight active section in sidebar
  const observerOptions = {
    root: null,
    rootMargin: '-100px 0px -66%',
    threshold: 0
  };

  const headings = document.querySelectorAll('.api-section h2, .api-section h3');
  const sidebarLinks = document.querySelectorAll('.api-sidebar a');

  if (headings.length > 0 && sidebarLinks.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          sidebarLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, observerOptions);

    headings.forEach(heading => {
      if (heading.id) {
        observer.observe(heading);
      }
    });
  }

  // Search functionality (if search exists)
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const items = document.querySelectorAll('.searchable-item');

      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? '' : 'none';
      });
    });
  }
});

// Basic syntax highlighting
function highlightCode() {
  document.querySelectorAll('pre code').forEach(block => {
    let html = block.innerHTML;

    // Keywords
    const keywords = ['import', 'export', 'from', 'const', 'let', 'var', 'function', 'async', 'await', 'return', 'if', 'else', 'new', 'class', 'extends', 'interface', 'type'];
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b(${kw})\\b`, 'g');
      html = html.replace(regex, '<span class="hljs-keyword">$1</span>');
    });

    // Strings
    html = html.replace(/(["'`])(?:(?!\1)[^\\]|\\.)*\1/g, '<span class="hljs-string">$&</span>');

    // Numbers
    html = html.replace(/\b(\d+)\b/g, '<span class="hljs-number">$1</span>');

    // Comments
    html = html.replace(/(\/\/.*)/g, '<span class="hljs-comment">$1</span>');

    block.innerHTML = html;
  });
}

// Run highlighting after DOM load
document.addEventListener('DOMContentLoaded', highlightCode);
