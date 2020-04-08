console.log("EmojiSound: EmojiSound Loading...");

import jukeBox from '../sounds/jukeBox';

let playingSounds = false;
let onChange;

chrome.runtime.sendMessage({}, (_response) => {
  var checkReady = setInterval(() => {
    if (document.readyState === "complete") {
      clearInterval(checkReady);
      const messagePane = document.querySelector('[data-qa="message_pane"]');
      onChange(messagePane);
      playingSounds = true;

      let observer = new MutationObserver(onChange.bind(undefined, messagePane));
      observer.observe(messagePane, {childList: true, subtree: true});
    }
  });
});

(function () {
  const emojiLog = {};

  onChange = function onChange(messagePane) {
    const emojis = messagePane.querySelectorAll('[data-qa="message_container"] .p-rich_text_section img.c-emoji');
    const channelName = document.querySelector('[data-qa="channel_name"]').innerHTML;

    emojis.forEach(emoji => {
      const name = emoji['alt'];
      const id = `${channelName}-${findPostedTime(emoji)}`;

      if (!alreadyExists(name, id)) {
        console.log('EmojiSound: new emoji detected', name);
        addToLog(name, id);
        playSound(name);
      }
    });
  };

  function alreadyExists(name, id) {
    return emojiLog[name] && emojiLog[name].has(id);
  }

  function addToLog(name, id) {
    console.log('EmojiSound: Adding to log', name, id)
    if (emojiLog[name] === undefined) {
      emojiLog[name] = new Set();
    }
    emojiLog[name].add(id)
  }

  function playSound(name) {
    if (playingSounds) {
      jukeBox.play(name);
    }
  }

  function findPostedTime(emojiNode) {
    return emojiNode.closest('[data-qa="virtual-list-item"]').querySelector('.c-timestamp__label').textContent
  }
})();

