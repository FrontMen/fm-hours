import jtwDecode from 'jwt-decode';
import axios from 'axios';
import getBridgeUuidFromIntracto, {SIGN_IN_ATTR} from './me';

const mockAuthToken = 'mock-token';
const mockPpid = 'mock-ppid';
const mockBridgeUid = 1234;
const mockConnectionInfo = {
  user_name: 'test',
  full_name: 'Test Tester',
  email: 'test@test.test',
  groups: ['TEST_EMPLOYEE', 'RANDOM_TEST_STRING'],
  cookie_domain: 'test_cookie_domain',
  cookie_value: 'test_cookie_value',
  cookie_expiration: 'test_cookie_expiration',
};

jest.mock('jwt-decode');
const mockJtwDecode = (jtwDecode as jest.Mock).mockImplementation(() => ({
  firebase: {
    sign_in_attributes: {
      [SIGN_IN_ATTR]: mockPpid,
    },
  },
}));

jest.mock('axios', () => {
  return {
    get: jest.fn(() => Promise.resolve({data: mockBridgeUid})),
    post: jest.fn(() =>
      Promise.resolve({
        data: mockConnectionInfo,
      })
    ),
  };
});
const mockAxios = axios as unknown as {
  post: jest.Mock;
  get: jest.Mock;
};

describe('fn: getBridgeUuidFromIntracto', () => {
  it('returns 400 with an error message if not receive authorization via headers', async () => {
    const {run, mockJsonFn, mockStatusFn} = getBridgeUuidFromIntractoSetup();

    await run({headers: {}});

    expect(mockStatusFn).toHaveBeenCalledWith(400);
    expect(mockJsonFn).toHaveBeenCalledWith({
      message: 'Authorization header is missing',
    });
  });

  it('decodes the authorization token received', async () => {
    const {run} = getBridgeUuidFromIntractoSetup();

    await run();

    expect(mockJtwDecode).toHaveBeenCalledWith(mockAuthToken);
  });

  it('gets brigdeUid sending authCookie in the headers', async () => {
    const {run} = getBridgeUuidFromIntractoSetup();

    await run();

    const [firstCall] = mockAxios.get.mock.calls;
    const [url, configuration] = firstCall;
    expect(url).toMatchInlineSnapshot(
      `"https://bridge.hosted-tools.com/api/v1/users/me"`
    );
    expect(configuration).toMatchInlineSnapshot(`
      Object {
        "headers": Object {
          "Cookie": "hosted-tools-api-auth-2=test_cookie_value",
        },
      }
    `);
  });

  it('returns the bridgeUid if everything went fine', async () => {
    const {run, mockJsonFn} = getBridgeUuidFromIntractoSetup();

    await run();

    expect(mockJsonFn).toHaveBeenCalledTimes(1);
    expect(mockJsonFn).toHaveBeenCalledWith({
      bridgeUid: mockBridgeUid,
    });
  });
});

/**
 * To avoid a bunch of boilerplate code, this setup function encapsulates the
 * configuration of getBridgeUuidFromIntracto
 */
function getBridgeUuidFromIntractoSetup() {
  const mockJsonFn = jest.fn();
  const mockStatusFn = jest.fn(() => ({json: mockJsonFn}));

  const request = {
    headers: {
      authorization: mockAuthToken,
    } as {authorization?: string},
  };
  const response = {
    status: mockStatusFn,
    json: mockJsonFn,
  };

  return {
    mockJsonFn,
    mockStatusFn,
    request,
    response,

    run(customRequest = request, customResponse = response) {
      return getBridgeUuidFromIntracto(
        customRequest as any,
        customResponse as any
      );
    },
  };
}
