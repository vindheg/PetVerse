// src/utils/toast.js - Enhanced Toast Notifications with Icons
// Premium toast notification system with SVG icons and smooth animations

const TOAST_ICONS = {
  success: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="11" fill="white" fill-opacity="0.2"/>
    <path d="M7 12L10.5 15.5L17 8.5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  error: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="11" fill="white" fill-opacity="0.2"/>
    <path d="M8 8L16 16M16 8L8 16" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,
  warning: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="11" fill="white" fill-opacity="0.2"/>
    <path d="M12 7V13M12 17H12.01" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,
  info: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="11" fill="white" fill-opacity="0.2"/>
    <path d="M12 11V17M12 7H12.01" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`
};

const TOAST_GRADIENTS = {
  success: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  error: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
  warning: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  info: 'linear-gradient(135deg, #8B5FBF 0%, #6D4C9F 100%)'
};

// Inject toast styles if not present
const injectToastStyles = () => {
  if (document.getElementById('toast-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'toast-styles';
  styles.textContent = `
    .toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      gap: 14px;
      pointer-events: none;
    }
    
    .toast {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 22px;
      border-radius: 16px;
      color: white;
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 0.95rem;
      font-weight: 500;
      box-shadow: 
        0 12px 40px rgba(0, 0, 0, 0.2), 
        0 4px 12px rgba(0, 0, 0, 0.1),
        0 0 0 1px rgba(255,255,255,0.1) inset;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      pointer-events: auto;
      transform: translateX(120%);
      opacity: 0;
      transition: all 0.5s cubic-bezier(0.68, -0.35, 0.265, 1.35);
      max-width: 400px;
      min-width: 300px;
      position: relative;
      overflow: hidden;
    }
    
    .toast::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%);
      pointer-events: none;
    }
    
    .toast.show {
      transform: translateX(0);
      opacity: 1;
    }
    
    .toast.hide {
      transform: translateX(120%);
      opacity: 0;
    }
    
    .toast-icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: toastIconPop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s both;
    }
    
    @keyframes toastIconPop {
      0% { transform: scale(0); }
      100% { transform: scale(1); }
    }
    
    .toast-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 1;
    }
    
    .toast-message {
      line-height: 1.5;
      letter-spacing: 0.01em;
    }
    
    .toast-close {
      flex-shrink: 0;
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      font-size: 16px;
      font-weight: 600;
      position: relative;
      z-index: 1;
    }
    
    .toast-close:hover {
      background: rgba(255,255,255,0.35);
      transform: scale(1.1);
    }
    
    .toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 4px;
      background: rgba(255,255,255,0.5);
      border-radius: 0 0 16px 16px;
      animation: toast-progress linear forwards;
    }
    
    @keyframes toast-progress {
      from { width: 100%; }
      to { width: 0%; }
    }
    
    @media (max-width: 480px) {
      .toast-container {
        left: 16px;
        right: 16px;
        top: 16px;
      }
      .toast {
        max-width: 100%;
        min-width: auto;
      }
    }
  `;
  document.head.appendChild(styles);
};

// Create or get toast container
const getToastContainer = () => {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
};

export const showToast = (message, type = 'info', duration = 4000) => {
  injectToastStyles();
  const container = getToastContainer();

  // Clear existing toasts to ensure only one appears at a time
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.background = TOAST_GRADIENTS[type] || TOAST_GRADIENTS.info;

  toast.innerHTML = `
    <div class="toast-icon">${TOAST_ICONS[type] || TOAST_ICONS.info}</div>
    <div class="toast-content">
      <span class="toast-message">${message}</span>
    </div>
    <button class="toast-close" aria-label="Dismiss">×</button>
    ${duration ? `<div class="toast-progress" style="animation-duration: ${duration}ms"></div>` : ''}
  `;

  // Add to container
  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Close button
  const closeBtn = toast.querySelector('.toast-close');
  const closeToast = () => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 500);
  };

  closeBtn.addEventListener('click', closeToast);

  // Auto dismiss
  if (duration) {
    setTimeout(closeToast, duration);
  }

  return toast;
};

// Special success toast for login - Premium popup overlay
export const showLoginSuccess = (userName = 'User', isAdmin = false) => {
  injectToastStyles();

  // Detect dark mode
  const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'login-success-overlay';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: ${isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.6)'};
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    z-index: 9999999;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.4s ease;
  `;

  const successCard = document.createElement('div');
  successCard.style.cssText = `
    background: ${isDarkMode
      ? 'linear-gradient(145deg, #1F2937 0%, #374151 100%)'
      : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'};
    padding: 48px 60px;
    border-radius: 28px;
    text-align: center;
    box-shadow: ${isDarkMode
      ? '0 30px 100px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.1) inset'
      : '0 30px 100px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.8) inset'};
    transform: scale(0.8) translateY(20px);
    opacity: 0;
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    max-width: 420px;
    position: relative;
    overflow: hidden;
  `;

  const gradient = isAdmin
    ? 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)'
    : 'linear-gradient(135deg, #10B981 0%, #059669 100%)';

  const textColor = isDarkMode ? '#E5E7EB' : '#1F2937';
  const subtextColor = isDarkMode ? '#9CA3AF' : '#6B7280';

  successCard.innerHTML = `
    <div style="
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: ${gradient};
    "></div>
    <div style="
      width: 90px; 
      height: 90px; 
      background: ${gradient}; 
      border-radius: 50%; 
      margin: 0 auto 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 12px 40px ${isAdmin ? 'rgba(59, 130, 246, 0.4)' : 'rgba(16, 185, 129, 0.4)'};
      animation: successPulse 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    ">
      <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="animation: checkDraw 0.5s ease 0.3s both;">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
    <h2 style="
      margin: 0 0 10px; 
      font-size: 2rem; 
      font-weight: 800; 
      color: ${textColor};
      font-family: 'Poppins', -apple-system, sans-serif;
      letter-spacing: -0.02em;
    ">Welcome${isAdmin ? ' Admin' : ''}!</h2>
    <p style="
      margin: 0 0 24px; 
      color: ${subtextColor}; 
      font-size: 1.05rem;
      font-family: 'Poppins', -apple-system, sans-serif;
      line-height: 1.5;
    ">Login successful, <strong style="color: ${textColor};">${userName}</strong></p>
    <div style="
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      color: ${subtextColor};
      font-size: 0.9rem;
      padding: 10px 20px;
      background: ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};
      border-radius: 50px;
      font-family: 'Poppins', -apple-system, sans-serif;
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1.5s linear infinite;">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      Redirecting...
    </div>
  `;

  // Add keyframes if not exists
  if (!document.getElementById('login-success-keyframes')) {
    const keyframes = document.createElement('style');
    keyframes.id = 'login-success-keyframes';
    keyframes.textContent = `
      @keyframes successPulse {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1.15); }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes checkDraw {
        0% { stroke-dasharray: 50; stroke-dashoffset: 50; }
        100% { stroke-dasharray: 50; stroke-dashoffset: 0; }
      }
      @keyframes spin {
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(keyframes);
  }

  overlay.appendChild(successCard);
  document.body.appendChild(overlay);

  // Animate in
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    successCard.style.transform = 'scale(1) translateY(0)';
    successCard.style.opacity = '1';
  });

  // Return promise that resolves when animation should end
  return new Promise(resolve => {
    setTimeout(() => {
      overlay.style.opacity = '0';
      successCard.style.transform = 'scale(0.9) translateY(-20px)';
      successCard.style.opacity = '0';
      setTimeout(() => {
        overlay.remove();
        resolve();
      }, 400);
    }, 2200);
  });
};

export default { showToast, showLoginSuccess };