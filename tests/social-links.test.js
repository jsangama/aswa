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
  test('adds new official channels to the social grid and floating menu', () => {
    const window = setupSocialDom();

    window.aswaEnsureOfficialSocialLinks();

    const urls = [
      'https://www.linkedin.com/in/aswa-la-rica-chicha-83000140b',
      'https://pin.it/40HJklUKW',
      'https://bsky.app/profile/aswalaricachicha.bsky.social',
      'https://www.reddit.com/user/HourFoundation2004/'
    ];

    urls.forEach(url => {
      expect(window.document.querySelector(`#socialGrid a[href="${url}"]`)).toBeTruthy();
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

  test('uses SVG logos for the added social cards', () => {
    const window = setupSocialDom();

    window.aswaEnsureOfficialSocialLinks();

    ['linkedin', 'pinterest', 'bluesky', 'reddit'].forEach(key => {
      const card = window.document.querySelector(`#socialGrid a[data-aswa-social="${key}"]`);
      expect(card).toBeTruthy();
      expect(card.querySelector('.sico svg')).toBeTruthy();
    });
  });
});
