import { useSelector } from "react-redux";
import BottomTabs from "./BottomTabs";
import AuthStack from "./AuthStack";

export default function Navigator() {
  const user = useSelector((state) => state.auth.user);

  return user ? <BottomTabs /> : <AuthStack />;
}
