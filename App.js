import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";

// Initalize the database
async function initialiseDatabase(db) {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstname TEXT,
        lastname TEXT,
        age INTEGER,
        email TEXT
      );
    `);
    console.log('Database initialised');
  } catch (error) {
    console.log("Error while initializin the database : ", error);
  }
}

export default function App() {
  return (
    <SQLiteProvider databaseName="example.db" onInit={initialiseDatabase}>
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>
        <StatusBar style="auto" />
      </View>
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
