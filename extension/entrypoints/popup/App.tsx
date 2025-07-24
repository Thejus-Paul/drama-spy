import { createResource, For } from "solid-js";
import "./App.css";
import Stats from "stats.js";
import Dramas from "../apis/dramas";

const getDramas = async () => await Dramas.index();

const App = () => {
  const [dramas] = createResource(getDramas);

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
      <div class="drama-list">
        <For each={dramas()} fallback={<div>Loading...</div>}>
          {({ name, lastWatchedEpisode }) => (
            <div class="drama-card">
              <span>{name}</span>
              <span>
                Stopped at episode <strong>{lastWatchedEpisode}</strong>
              </span>
            </div>
          )}
        </For>
      </div>
    </>
  );
};

export default App;
