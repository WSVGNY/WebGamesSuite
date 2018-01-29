import { Container } from "inversify";
import Types from "./types";
import { Server } from "./server";
import { Application } from "./app";
import { Index } from "./routes/index";
import { Routes } from "./routes";
import { TrackRoute } from "./routes/track-route";
import { LexiconService } from "./crossword/lexicon-service";
import { Grid } from "./crossword/gridCreate_service";

const container: Container = new Container();

container.bind(Types.Server).to(Server);
container.bind(Types.Application).to(Application);
container.bind(Types.Routes).to(Routes);
container.bind(Types.Index).to(Index);
container.bind(Types.TrackRoute).to(TrackRoute);
container.bind(Types.LexiconService).to(LexiconService);
container.bind(Types.Grid).to(Grid);

export { container };
