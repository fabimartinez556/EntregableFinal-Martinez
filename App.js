import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { store } from "./src/store/store";
import Navigator from "./src/navigation/Navigator";
import { setUser, logout } from "./src/store/authSlice";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./src/firebase/firebaseConfig";
import { loadCart } from "./src/store/cartThunks";

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadCart());

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(
          setUser({
            uid: user.uid,
            email: user.email,
          })
        );
      } else {
        dispatch(logout());
      }
    });

    return unsubscribe;
  }, []);

  return <Navigator />;
}

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </Provider>
  );
}
