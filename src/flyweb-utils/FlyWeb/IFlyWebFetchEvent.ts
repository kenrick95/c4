export interface IFlyWebFetchEvent extends Event {
  request: Request;

  respondWith(response: Promise<Response>): void;
};
