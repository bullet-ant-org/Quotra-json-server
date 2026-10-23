import { Composition } from "remotion";
import { Promo } from "./Promo";

export const Root = () => <Composition id="Promo" component={Promo} durationInFrames={900} fps={30} width={1080} height={1920} />;
