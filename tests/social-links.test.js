const fs = require('fs');
const path = require('path');
const { TextDecoder, TextEncoder } = require('util');

global.TextDecoder = global.TextDecoder || TextDecoder;
global.TextEncoder = global.TextEncoder || TextEncoder;

const { JSDOM, VirtualConsole } = require('jsdom');

function setupSocialDom() {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const virtualConsole = new VirtualConsole();
  return new JSDOM(html, {
    runScripts: 'dangerously',
    url: 'http://localhost',
    virtualConsole
  }).window;
}

describe('official social links', () => {
  test('keeps secondary channels in the floating menu only', () => {
    const window = setupSocialDom();

    window.aswaEnsureOfficialSocialLinks();

    const urls = [
      'https://www.linkedin.com/in/aswa-la-rica-chicha-83000140b',
      'https://pin.it/40HJklUKW',
      'https://bsky.app/profile/aswalaricachicha.bsky.social',
      'https://www.reddit.com/user/HourFoundation2004/'
    ];

    urls.forEach(url => {
      expect(window.document.querySelector(`#socialGrid a[href="${url}"]`)).toBeFalsy();
      expect(window.document.querySelector(`#aswaSocialShareMenu a[href="${url}"]`)).toBeTruthy();
    });
  });

  test('uses real SVG logos in the floating social menu', () => {
    const window = setupSocialDom();

    window.aswaEnsureOfficialSocialLinks();

    [
      'facebook',
      'instagram',
      'whatsapp',
      'tiktok',
      'x',
      'youtube',
      'maps',
      'linkedin',
      'pinterest',
      'bluesky',
      'reddit'
    ].forEach(key => {
      const link = window.document.querySelector(`#aswaSocialShareMenu a[data-aswa-social="${key}"]`);
      expect(link).toBeTruthy();
      expect(link.querySelector('svg')).toBeTruthy();
      expect(link.textContent.trim()).toBe('');
    });
  });

  test('keeps the home social grid focused on the most relevant channels', () => {
    const window = setupSocialDom();

    window.aswaEnsureOfficialSocialLinks();

    expect(window.document.querySelectorAll('#socialGrid a.social-btn')).toHaveLength(7);
    ['linkedin', 'pinterest', 'bluesky', 'reddit'].forEach(key => {
      expect(window.document.querySelector(`#socialGrid a[data-aswa-social="${key}"]`)).toBeFalsy();
    });
  });
});
