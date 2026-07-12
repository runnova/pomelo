import { createSignal } from 'solid-js'
import './App.css'
import './components/styles/basic.css'
import Editor from "./components/editor/Editor"

function App() {
  const [count, setCount] = createSignal(0)

  return Editor
}

export default App