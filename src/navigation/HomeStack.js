import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen.jsx";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: "Inicio" }}
      />
    </Stack.Navigator>
  );
}
