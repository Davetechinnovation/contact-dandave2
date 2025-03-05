import { Routes, Route } from "react-router-dom"; // Import Routes and Route
import ContactForm from "./component/contactform"; // Import your ContactForm component
import Auth from "./component/auth"; // Example: Import a Login component

function App() {
  return (
    <Routes>
      <Route path="/" element={<ContactForm />} /> {/* Route for ContactForm */}
      <Route path="/auth" element={<Auth />} /> {/* Route for Login */}
    </Routes>
  );
}

export default App;