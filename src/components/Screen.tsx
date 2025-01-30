import { Header } from "./Header";
import { Footer } from "./Footer";
// Helper components
export const LoadingScreen = () => (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        Loading configuration...
      </div>
      <Footer />
    </div>
  );
  
export const ErrorScreen = () => (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 flex items-center justify-center text-red-500">
        Error loading configuration. Please check the config.json file exists
        at the correct path and contains valid settings.
      </div>
      <Footer />
    </div>
  );