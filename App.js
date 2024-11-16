import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, FlatList } from "react-native";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { useState, useEffect } from "react";

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
  } catch (error) {
    console.log("Error while initializing the database:", error);
  }
}

export default function App() {
  return (
    <SQLiteProvider databaseName="example2.db" onInit={initialiseDatabase}>
      <View style={styles.container}>
        <Text style={styles.title}>List of student</Text>
        <Content />
        <StatusBar style="auto" />
      </View>
    </SQLiteProvider>
  );
}

const Content = () => {
  const db = useSQLiteContext();
  const [students, setStudents] = useState([]);

  // Function to get all the students
  const getStudents = async () => {
    try {
      const allRows = await db.getAllAsync("SELECT * FROM students");
      setStudents(allRows);
    } catch (error) {
      console.log("Error while loading students: ", error);
    }
  };

  // Function to add a student
  const addStudent = async (newStudent) => {
    try {
      const statement = await db.prepareAsync(
        "INSERT INTO students (firstname, lastname, age, email) VALUES (?, ?, ?, ?)"
      );
      await statement.executeAsync([
        newStudent.firstname,
        newStudent.lastname,
        newStudent.age,
        newStudent.email,
      ]);
      await getStudents();
    } catch (error) {
      console.log("Error while adding student: ", error);
    }
  };

  const deleteAllStudent = async () => {
    try {
      await db.runAsync('DELETE FROM students');
      await getStudents();      
    } catch (error) {
      console.log('Error while deleting all the student : ', error);
    }
  }

  // Get all the students at the first render of the app
  useEffect(() => {
    addStudent({
      firstname: "Lucas",
      lastname: "Smith",
      age: 22,
      email: "lucas.smith@ex.com",
    });
    //deleteAllStudent();
    getStudents();
  }, []);

  return (
    <View>
      {students.length === 0 ? (
        <Text>No students to load!</Text>
      ) : (
        <FlatList
          data={students}
          renderItem={({ item }) => (
            <Text>
              {item.id} - {item.lastname}
            </Text>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 60,
    marginBottom: 20,
  },
});
