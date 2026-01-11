import { FlatList, Text, View, ActivityIndicator } from "react-native";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import ScreenContainer from "../components/ScreenContainer";
import Header from "../components/Header";
import { fetchTasks } from "../store/tasksThunks";

export default function ShopScreen() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks());
  }, []);

  if (loading) {
    return (
      <ScreenContainer>
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Header title="Tareas en Firebase" />

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 15 }}>
            <Text>{item.description}</Text>
          </View>
        )}
      />
    </ScreenContainer>
  );
}
