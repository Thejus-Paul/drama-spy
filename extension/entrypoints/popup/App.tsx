import { createResource, For } from "solid-js";
import "./App.css";
import Stats from "stats.js";
import Dramas from "../apis/dramas";
import { getDramaLink, isString } from "./utils";

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
          {({ name, lastWatchedEpisode, metadata, posterUrl }) => (
            <div class="drama-card">
              {posterUrl && (
                <img
                  src={posterUrl}
                  alt={`${name} poster`}
                  class="drama-poster"
                />
              )}
              <div class="drama-content">
                <div style="display: flex; flex-direction: column; align-items: flex-start;">
                  <strong>{name}</strong>
                  <span>
                    Last watched: <strong>{lastWatchedEpisode}</strong>
                  </span>
                </div>
                {isString(metadata.id) && (
                  <a href={getDramaLink(name, metadata.id)} target="_blank">
                    Continue watching
                  </a>
                )}
              </div>
            </div>
          )}
        </For>
      </div>
    </>
  );
};

export default App;
