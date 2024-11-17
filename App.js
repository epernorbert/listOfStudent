import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { useState, useEffect } from "react";
import { AntDesign } from "@expo/vector-icons";

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

//StudentButton component
const StudentButton = ({ student }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);

  return (
    <View>
      <Pressable
        style={styles.studentButton}
        onPress={() =>
          setSelectedStudent(selectedStudent === student.id ? null : student.id)
        }
      >
        <Text style={styles.studentText}>
          {student.id} - {student.lastname}
        </Text>
      </Pressable>
      {selectedStudent === student.id && (
        <View style={styles.studentContent}>
          <Text>Fist Name : {student.firstname}</Text>
          <Text>Last Name : {student.lastname}</Text>
          <Text>Age : {student.age}</Text>
          <Text>Email : {student.email}</Text>
        </View>
      )}
    </View>
  );
};

const StudentForm = ({ addStudent, setShowForm }) => {
  const [student, setStudent] = useState({
    id: 0,
    firstname: "",
    lastname: "",
    age: 0,
    email: "",
  });
  const handleSave = () => {
    if (
      student.firstname.length === 0 ||
      student.lastname.length === 0 ||
      student.age.length === 0 ||
      student.email.length === 0
    ) {
      Alert.alert("Attention", "Please enter all the data");
    } else {
      addStudent(student);
    }
  };

  return (
    <View>
      <TextInput
        style={styles.input}
        placeholder="First name"
        value={student.firstname}
        onChangeText={(text) => setStudent({ ...student, firstname: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Last name"
        value={student.lastname}
        onChangeText={(text) => setStudent({ ...student, lastname: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Age"
        value={student.age}
        onChangeText={(text) => setStudent({ ...student, age: text })}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={student.email}
        onChangeText={(text) => setStudent({ ...student, email: text })}
        keyboardType="email-address"
      />
      <Pressable onPress={handleSave} style={styles.saveButton}>
        <Text style={styles.buttonText}>Save</Text>
      </Pressable>
      <Pressable onPress={() => setShowForm(false)} style={styles.cancelButton}>
        <Text style={styles.buttonText}>Cancel</Text>
      </Pressable>
    </View>
  );
};

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
  const [showForm, setShowForm] = useState(false);

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
      await db.runAsync("DELETE FROM students");
      await getStudents();
    } catch (error) {
      console.log("Error while deleting all the student : ", error);
    }
  };

  // function to confirm deleting all student
  const confirmDeleteAll = () => {
    Alert.alert(
      "Attention",
      "Are you sure you want to delete all the students?",
      [
        { text: "No", onPress: () => {}, styles: "cancel" },
        { text: "Yes", onPress: deleteAllStudent },
      ],
      { cancelable: true }
    );
  };

  // Get all the students at the first render of the app
  useEffect(() => {
    /* addStudent({
      firstname: "Lucas",
      lastname: "Smith",
      age: 22,
      email: "lucas.smith@ex.com",
    }); */
    /* deleteAllStudent(); */
    getStudents();
  }, []);

  return (
    <View style={styles.contentContainer}>
      {students.length === 0 ? (
        <Text>No students to load!</Text>
      ) : (
        <FlatList
          data={students}
          renderItem={({ item }) => <StudentButton student={item} />}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
      {showForm && (
        <StudentForm addStudent={addStudent} setShowForm={setShowForm} />
      )}
      <View>
        <AntDesign
          name="pluscircleo"
          size={30}
          color="blue"
          onPress={() => setShowForm(true)}
          style={styles.icon}
        />
        <AntDesign
          name="deleteusergroup"
          size={30}
          color="red"
          onPress={confirmDeleteAll}
          style={styles.icon}
        />
      </View>
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
  contentContainer: {
    flex: 1,
    width: "90%",
  },
  studentButton: {
    backgroundColor: "lightblue",
    padding: 5,
    marginVertical: 5,
  },
  studentText: {
    fontSize: 20,
    fontWeight: "bolder",
  },
  studentContent: {
    backgroundColor: "#cdcdcd",
    padding: 10,
  },
  icon: {
    marginHorizontal: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginVertical: 3,
  },
  saveButton: {
    backgroundColor: "blue",
    padding: 10,
    marginVertical: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "grey",
    padding: 10,
    marginVertical: 5,
  },
});
