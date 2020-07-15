import GetTxoutgroupByName from '../../../../src/services/use_cases/txoutgroup/GetTxoutgroupByName';
import { Container } from 'typedi';

describe('GetTxoutsByGroup#run', () => {
  beforeEach(() => {});
  it('run', async done => {

    const uc = Container.get(GetTxoutgroupByName);
    const response = await uc.run({
      groupname: 'groupname',
      offset: 0,
      limit: 1000
    });
    expect(response).toEqual({});
    done();
  });

});
