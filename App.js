import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";

// Initialize the database
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
    console.log("Database initialised");

    // Insert dummy data
    await insertDummyData(db);

    // Print out the data
    await fetchAndLogData(db);
  } catch (error) {
    console.log("Error while initializing the database:", error);
  }
}

// Function to insert dummy data
async function insertDummyData(db) {
  try {
    await db.execAsync(`
      INSERT INTO students (firstname, lastname, age, email)
      VALUES 
        ('John', 'Doe', 20, 'john.doe@example.com'),
        ('Jane', 'Smith', 22, 'jane.smith@example.com'),
        ('Alice', 'Johnson', 19, 'alice.johnson@example.com');
    `);
    console.log("Dummy data inserted successfully");
  } catch (error) {
    console.log("Error while inserting dummy data:", error);
  }
}

// Function to fetch and log the data
async function fetchAndLogData(db) {
  try {
    const rows = await db.getAllAsync("SELECT * FROM students;");
    console.log("Students Table Data:");
    rows.forEach((row) => {
      console.log(`ID: ${row.id}, Name: ${row.firstname} ${row.lastname}, Age: ${row.age}, Email: ${row.email}`);
    });
  } catch (error) {
    console.log("Error while fetching data:", error);
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
    backgroundColor: "#ff2",
    alignItems: "center",
    justifyContent: "center",
  },
});
