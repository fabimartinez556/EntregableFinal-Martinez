import { View, Text, StyleSheet } from "react-native";
import TaskList from "./TasksList";
import {
  useGetTasksQuery,
  useDeleteTaskMutation,
  useToggleTaskMutation,
} from "../store/tasksApi";

export default function HomeScreen() {
  const { data: tasks = [], isLoading, error } = useGetTasksQuery();
  const [deleteTask] = useDeleteTaskMutation();
  const [toggleTask] = useToggleTaskMutation();

  if (isLoading) return <Text>Cargando tareas...</Text>;
  if (error) return <Text>Error al cargar tareas</Text>;

  return (
    <View style={styles.container}>
      <TaskList
        tasks={tasks}
        onDelete={(id) => deleteTask(id)}
        onToggle={(id) => toggleTask(id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
