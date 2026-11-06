import {describe, expect, it} from 'vitest';
import {advancedFields, emptyNode, manualFields, manualInvalid, manualLink, nodeLink, parseNodeLink} from './nodeForm';

const valid = () => ({...emptyNode('shadowquic'), host: '2001:db8::1', username: 'user@name', password: 'p:word', sni: 'cover.example'});
describe('ShadowQUIC forms', () => {
  it('requires JLS credentials and SNI without UUID or TLS controls', () => {
    expect(manualInvalid(valid())).toEqual([]);
    expect(manualInvalid({...emptyNode('shadowquic'), host: 'proxy.example'})).toEqual(['username', 'password', 'sni']);
    expect(manualFields(valid()).map(field => field.key)).toEqual(['username', 'password', 'sni', 'congestion']);
    expect(advancedFields(valid()).map(field => field.key)).toEqual(['alpn', 'zero-rtt', 'over-stream', 'mtu', 'half-close-timeout']);
  });
  it('escapes credentials and preserves explicit false and zero values', () => {
    const fields = {...valid(), 'zero-rtt': 'false', 'over-stream': 'false', 'half-close-timeout': '0'};
    const link = manualLink(fields);
    expect(link).toContain('user%40name:p%3Aword@[2001:db8::1]:443');
    const parsed = parseNodeLink(link);
    expect(parsed.fields['zero-rtt']).toBe('false');
    expect(parsed.fields['half-close-timeout']).toBe('0');
    expect(nodeLink(parsed.fields, parsed.document)).toBe(link);
  });
  it.each([
    ['mtu', '1199'],
    ['mtu', '1400ms'],
    ['half-close-timeout', '-1'],
    ['half-close-timeout', '9007199254740992'],
    ['alpn', 'h3,,h2'],
    ['alpn', 'a'.repeat(256)],
    ['zero-rtt', 'yes'],
    ['over-stream', 'on'],
    ['sni', ' '],
    ['congestion', 'brutal']
  ])('rejects invalid %s=%s', (key, value) => {
    expect(manualInvalid({...valid(), [key]: value})).toContain(key);
    expect(manualLink({...valid(), [key]: value})).toBe('');
  });
  it.each(['insecure=1', 'security=tls', 'sni=cover.example&peer=other.example', 'mtu=1400&mtu=1500', 'zero-rtt=yes'])(
    'rejects unsupported or conflicting imported options: %s',
    query => {
      expect(() => parseNodeLink(`shadowquic://u:p@proxy.example?sni=cover.example&${query}`)).toThrow();
    }
  );
  it('edits the peer alias without leaving stale SNI and retains the chain', () => {
    const link = 'shadowquic://u:p@proxy.example?peer=cover.example#test -> socks5://127.0.0.1:1080';
    const {fields, document} = parseNodeLink(link);
    const edited = nodeLink({...fields, sni: 'new.example'}, document);
    expect(edited).toContain('sni=new.example');
    expect(edited).not.toContain('peer=');
    expect(edited).toContain(' -> socks5://127.0.0.1:1080');
  });
  it.each(['alpn=', 'zero-rtt=', 'mtu=', 'mtu=+1400', 'over-stream=%20true%20'])('rejects empty or malformed imported values: %s', query => {
    expect(() => parseNodeLink(`shadowquic://u:p@proxy.example?sni=cover.example&${query}`)).toThrow();
  });
  it('rejects exponent ports and untrimmed numbers or SNI', () => {
    expect(manualInvalid({...valid(), port: '1e3'})).toContain('port');
    expect(manualInvalid({...valid(), mtu: ' 1400'})).toContain('mtu');
    expect(manualInvalid({...valid(), sni: ' cover.example'})).toContain('sni');
  });
});
