import { createSignal } from "solid-js";
import "./App.css";
import Stats from "stats.js";

function App() {
  const [count, setCount] = createSignal(0);

  const stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom);

  function animate() {
    stats.begin();
    stats.end();
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  return (
    <>
      <h1>DraMA Spy</h1>
      <div class="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count()}
        </button>
      </div>
    </>
  );
}

export default App;
