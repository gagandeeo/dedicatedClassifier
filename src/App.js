import './App.css';
import React from "react";
import UploadPage from './pages/UploadPage';

function App() {
  // const [result, setResult] = useState(false);
  const result = false;
  return (
    <div className="App">
      {result? (
        <h1>ResultPage</h1>
      ):(
        <UploadPage/>
      )}
    </div>
  );
}

export default App;
