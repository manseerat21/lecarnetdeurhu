// src/App.jsx
import "./App.css";
import FileStack from "./components/FileStack";

import Today from "./pages/TodayPage.jsx";
import Moon from "./pages/MoonPage.jsx";
import Cafe from "./pages/CafePage.jsx";
import Urhu from "./pages/UrhuPage.jsx";

const PAGES = [
  { key: "today", Component: Today },
  { key: "cafe", Component: Cafe },
  { key: "moon", Component: Moon },
  { key: "urhu", Component: Urhu },
];

function App() {
  return (
    <div className="app">
      <FileStack pages={PAGES} />
    </div>
  );
}

export default App;
