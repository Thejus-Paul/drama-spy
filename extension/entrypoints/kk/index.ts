import { DRAMA_PAGE } from "./constants";
import dramaPage from "./dramaPage";

const router = (url: URL | string) => {
  if (DRAMA_PAGE.includes(url)) dramaPage();
};

export default { router };
