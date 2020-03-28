import { ApplicationState } from "../src/state/ApplicationState";

declare module 'react-redux' {
  interface DefaultRootState extends ApplicationState {}
}