import api from "../services/api";

const updateLoadingText = async () => {
    try {
        const { data } = await api.get("/personalizations");
        let lightTheme = {};

        data.forEach(personalization => {
            if (personalization.theme === "light") {
                lightTheme = personalization;
            }
        });
        
        const loadingText = document.querySelector('.loading-text');
        if (loadingText && lightTheme.company) {
            loadingText.textContent = lightTheme.company;
        }
    } catch (error) {
        console.error('Erro ao carregar nome da empresa:', error);
    }
};

export const initializeLoading = () => {
    let progress = 0;
    const progressBar = document.getElementById('progress-bar');
    
    updateLoadingText();
    
    const interval = setInterval(() => {
        if (progress < 40) {
            progress += 5;
        } else if (progress < 70) {
            progress += 2;
        } else if (progress < 90) {
            progress += 0.5;
        }
        progressBar.style.width = progress + '%';
    }, 100);

    return () => {
        clearInterval(interval);
        const splash = document.getElementById('splash-screen');
        
        progressBar.style.width = '100%';
        
        setTimeout(() => {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.remove();
            }, 300);
        }, 500);
    };
};

export const showLoading = () => {
    const existingSplash = document.getElementById('splash-screen');
    if (existingSplash) {
        existingSplash.remove();
    }

    const splash = document.createElement('div');
    splash.id = 'splash-screen';
    splash.innerHTML = `
    <div class="loading-text">Loading...</div>
    <div class="progress-bar"></div>
      <div class="progress" id="progress-bar"></div>
    </div>
  `;
    document.body.appendChild(splash);

    updateLoadingText();
    return initializeLoading();
};