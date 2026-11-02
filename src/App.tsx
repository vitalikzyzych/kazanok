import { FirebaseSetupNotice } from "@/components";
import { IS_FIREBASE_CONFIGURED } from "@/constants/env";
import {
  CookingProvider,
  RecipeDataProvider,
  ToastProvider,
} from "@/providers";
import AppRouter from "@/routes/AppRouter";

const App = () => {
  if (!IS_FIREBASE_CONFIGURED) return <FirebaseSetupNotice />;

  return (
    <ToastProvider>
      <RecipeDataProvider>
        <CookingProvider>
          <AppRouter />
        </CookingProvider>
      </RecipeDataProvider>
    </ToastProvider>
  );
};

export default App;
