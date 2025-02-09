import { createResource, For, onMount } from "solid-js";
import "./App.css";
import Dramas from "../apis/dramas";
import { getDramaLink, getMetadataId, setupStatsMonitor } from "./utils";
import { WatchStatusEnum } from "@/types";

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
          {(drama) => {
            const metadataId = getMetadataId(drama.metadata);

            return (
              <div class="drama-card">
                {drama.posterUrl && (
                  <img
                    src={drama.posterUrl}
                    alt={`${drama.name} poster`}
                    class="drama-poster"
                  />
                )}
                <div class="drama-content">
                  <div style="display: flex; flex-direction: column; align-items: flex-start;">
                    <strong>{drama.name}</strong>
                    <span>
                      Last watched: <strong>{drama.lastWatchedEpisode}</strong>
                    </span>
                  </div>
                  {metadataId && (
                    <a
                      href={getDramaLink(drama.name, metadataId)}
                      target="_blank"
                    >
                      {drama.watchStatus === WatchStatusEnum.watching
                        ? "Continue watching"
                        : "Rewatch"}
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
