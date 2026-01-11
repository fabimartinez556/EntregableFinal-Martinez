import { View, Text, TextInput, Button, StyleSheet, Pressable } from "react-native";
import { useState } from "react";

export default function HomeScreen({ navigation }) {
  const [textItem, setTextItem] = useState("");
  const [itemList, setItemList] = useState([]);

  const addItem = () => {
    if (!textItem.trim()) return;

    const id = Date.now().toString();
    setItemList([...itemList, { id, description: textItem }]);
    setTextItem("");
  };

  const goToDetail = (item) => {
    navigation.navigate("Detail", {
      id: item.id,
      description: item.description,
    });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nueva tarea"
          value={textItem}
          onChangeText={setTextItem}
        />
        <Button title="Agregar" onPress={addItem} />
      </View>

      {itemList.map((item) => (
        <Pressable
          key={item.id}
          style={styles.item}
          onPress={() => goToDetail(item)}
        >
          <Text>{item.description}</Text>
        </Pressable>
      ))}
    </View>
  );
}
