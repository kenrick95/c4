export interface IFlyWebPublishedServer extends EventTarget {
  name: string;
  uiUrl?: string;

  onclose: EventListener;
  onfetch: EventListener;
  onwebsocket: EventListener;

  close(): void;
};
