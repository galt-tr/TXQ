import { Service, Inject } from 'typedi';
import Config from '../../cfg';

@Service('eventService')
export default class EventService {
  private initialized;
  constructor(
    @Inject('logger') private logger) {

    this.initialize();
  }

  public async initialize() {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
  }
}
