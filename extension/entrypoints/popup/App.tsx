import { createResource, For, onMount } from "solid-js";
import "./App.css";
import Dramas from "../apis/dramas";
import { getDramaLink, getMetadataId, setupStatsMonitor } from "./utils";

const getDramas = async () => await Dramas.index();

const App = () => {
  const [dramas] = createResource(getDramas);

  onMount(() => {
    setupStatsMonitor();
  });

  return (
    <>
      <h1>DraMA Spy</h1>
      <div class="drama-list">
        <For each={dramas()} fallback={<div>Loading...</div>}>
          {({ name, lastWatchedEpisode, metadata, posterUrl }) => {
            const metadataId = getMetadataId(metadata);

            return (
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
                  {metadataId && (
                    <a href={getDramaLink(name, metadataId)} target="_blank">
                      Continue watching
                    </a>
                  )}
                </div>
              </div>
            );
          }}
        </For>
      </div>
    </>
  );
};

export default App;
