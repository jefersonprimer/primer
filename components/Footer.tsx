import React from 'react';

export function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-black via-white to-black" />

      <div className="max-w-7xl mx-auto pt-8 px-8">
        <div className="flex flex-col md:flex-row px-8 justify-between items-start mb-12">
          <div className="mb-8 md:mb-0 max-w-md">
            <h2 className="text-2xl font-bold mb-4">Primer</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your real-time support tool that suggests responses and arguments during
              online meetings, helping you handle objections and communicate with more
              confidence.
            </p>
          </div>

          <div className="flex gap-12">
            <nav className="flex flex-col gap-3">
              <h3 className="text-white/60 text-base">Support</h3>
              <a href="/help-center" className="text-gray-300 hover:text-white transition-colors text-sm">
                Help center
              </a>
              <a href="mailto:jefersonprimer@gmail.com" className="text-gray-300 hover:text-white transition-colors text-sm">
                Contact us
              </a>
            </nav>
            <nav className="flex flex-col gap-3">
              <h3 className="text-white/60 text-base">Legal</h3>
              <a href="/terms-of-use" className="text-gray-300 hover:text-white transition-colors text-sm">
                Terms of Use
              </a>
              <a href="privacy-policy" className="text-gray-300 hover:text-white transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="cancellation-policy" className="text-gray-300 hover:text-white transition-colors text-sm">
                Cancellation Policy
              </a>
              <a href="refund-policy" className="text-gray-300 hover:text-white transition-colors text-sm">
                Refund Policy
              </a>
            </nav>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center px-8">
          <p className="text-gray-400 text-sm mb-4 sm:mb-0">
            © 2026 Primer. All rights reserved
          </p>
          
          <div className="flex gap-4">
            <a
              href="https://x.com/jefersonprimer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path d="M14.6009 2H17.0544L11.6943 8.35385L18 17H13.0627L9.19566 11.7562L4.77087 17H2.31595L8.04904 10.2038L2 2H7.06262L10.5581 6.79308L14.6009 2ZM13.7399 15.4769H15.0993L6.32392 3.44308H4.86506L13.7399 15.4769Z">
                </path>
              </svg>
            </a>
            <a
              href="https://istagram.com/jefersonprimer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 1C7.555 1 7.24975 1.01125 6.28975 1.054C5.33125 1.099 4.67875 1.24975 4.105 1.4725C3.51325 1.702 3.01075 2.01025 2.5105 2.5105C2.01025 3.01075 1.70125 3.5125 1.4725 4.105C1.24975 4.67875 1.09825 5.33125 1.054 6.28975C1.009 7.24975 1 7.555 1 10C1 12.445 1.01125 12.7503 1.054 13.7103C1.099 14.668 1.24975 15.3213 1.4725 15.895C1.702 16.486 2.01025 16.9893 2.5105 17.4895C3.01075 17.989 3.5125 18.2987 4.105 18.5275C4.6795 18.7495 5.332 18.9018 6.28975 18.946C7.24975 18.991 7.555 19 10 19C12.445 19 12.7503 18.9888 13.7103 18.946C14.668 18.901 15.3213 18.7495 15.895 18.5275C16.486 18.298 16.9893 17.989 17.4895 17.4895C17.989 16.9893 18.2987 16.4883 18.5275 15.895C18.7495 15.3213 18.9018 14.668 18.946 13.7103C18.991 12.7503 19 12.445 19 10C19 7.555 18.9888 7.24975 18.946 6.28975C18.901 5.332 18.7495 4.678 18.5275 4.105C18.298 3.51325 17.989 3.01075 17.4895 2.5105C16.9893 2.01025 16.4883 1.70125 15.895 1.4725C15.3213 1.24975 14.668 1.09825 13.7103 1.054C12.7503 1.009 12.445 1 10 1ZM10 2.62C12.4023 2.62 12.6888 2.632 13.6375 2.67325C14.515 2.7145 14.9913 2.86 15.3077 2.9845C15.7292 3.14725 16.0278 3.34225 16.3442 3.6565C16.6585 3.9715 16.8535 4.27075 17.0163 4.69225C17.1392 5.00875 17.2862 5.485 17.326 6.3625C17.3687 7.312 17.3785 7.597 17.3785 10C17.3785 12.403 17.3673 12.6888 17.323 13.6375C17.2773 14.515 17.131 14.9913 17.0072 15.3077C16.8393 15.7292 16.648 16.0278 16.333 16.3442C16.0188 16.6585 15.715 16.8535 15.298 17.0163C14.983 17.1392 14.4993 17.2862 13.6217 17.326C12.6663 17.3687 12.385 17.3785 9.9775 17.3785C7.56925 17.3785 7.288 17.3673 6.33325 17.323C5.455 17.2773 4.97125 17.131 4.65625 17.0072C4.2295 16.8393 3.93625 16.648 3.622 16.333C3.30625 16.0188 3.1045 15.715 2.947 15.298C2.82325 14.983 2.67775 14.4993 2.632 13.6217C2.59825 12.6768 2.58625 12.385 2.58625 9.98875C2.58625 7.59175 2.59825 7.29925 2.632 6.343C2.67775 5.4655 2.82325 4.9825 2.947 4.6675C3.1045 4.24 3.30625 3.9475 3.622 3.63175C3.93625 3.3175 4.2295 3.115 4.65625 2.95825C4.97125 2.83375 5.4445 2.6875 6.322 2.6425C7.27825 2.60875 7.5595 2.5975 9.96625 2.5975L10 2.62ZM10 5.3785C7.44625 5.3785 5.3785 7.4485 5.3785 10C5.3785 12.5538 7.4485 14.6215 10 14.6215C12.5538 14.6215 14.6215 12.5515 14.6215 10C14.6215 7.44625 12.5515 5.3785 10 5.3785ZM10 13C8.3425 13 7 11.6575 7 10C7 8.3425 8.3425 7 10 7C11.6575 7 13 8.3425 13 10C13 11.6575 11.6575 13 10 13ZM15.8845 5.19625C15.8845 5.7925 15.4 6.27625 14.8045 6.27625C14.2083 6.27625 13.7245 5.79175 13.7245 5.19625C13.7245 4.60075 14.209 4.117 14.8045 4.117C15.3993 4.11625 15.8845 4.60075 15.8845 5.19625Z">
                </path>
              </svg>
            </a>
            <a
              href="https://github.com/jefersonprimer/primer-desktop"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="X (Twitter)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20" 
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" clipRule="evenodd" d="M10 0.257812C4.5 0.257812 0 4.75781 0 10.2578C0 14.6328 2.875 18.3828 6.875 19.7578C7.375 19.8828 7.5 19.5078 7.5 19.2578C7.5 19.0078 7.5 18.3828 7.5 17.5078C4.75 18.1328 4.125 16.2578 4.125 16.2578C3.625 15.1328 3 14.7578 3 14.7578C2.125 14.1328 3.125 14.1328 3.125 14.1328C4.125 14.2578 4.625 15.1328 4.625 15.1328C5.5 16.7578 7 16.2578 7.5 16.0078C7.625 15.3828 7.875 14.8828 8.125 14.6328C5.875 14.3828 3.625 13.5078 3.625 9.63281C3.625 8.50781 4 7.63281 4.625 7.00781C4.5 6.75781 4.125 5.75781 4.75 4.38281C4.75 4.38281 5.625 4.13281 7.5 5.38281C8.25 5.13281 9.125 5.00781 10 5.00781C10.875 5.00781 11.75 5.13281 12.5 5.38281C14.375 4.13281 15.25 4.38281 15.25 4.38281C15.75 5.75781 15.5 6.75781 15.375 7.00781C16 7.75781 16.375 8.63281 16.375 9.63281C16.375 13.5078 14 14.2578 11.75 14.5078C12.125 15.0078 12.5 15.6328 12.5 16.5078C12.5 17.8828 12.5 18.8828 12.5 19.2578C12.5 19.5078 12.625 19.8828 13.25 19.7578C17.25 18.3828 20.125 14.6328 20.125 10.2578C20 4.75781 15.5 0.257812 10 0.257812Z">
              </path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
