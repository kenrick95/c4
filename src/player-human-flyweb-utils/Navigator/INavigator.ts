import { IFlyWebPublishedServer, FlyWebPublishOptions } from '../FlyWeb';


// extends the stadard navigator by adding the 'publishServer' method
// defined in: https://github.com/flyweb/spec
// currently, only Firefox Developer Edition (Aurora) and Nightly supports this spec.
export interface INavigator extends Navigator {
    publishServer(name: string, options?: FlyWebPublishOptions): Promise<IFlyWebPublishedServer>;
}
