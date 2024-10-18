// MentionBlot.js
import { Quill } from 'react-quill-new';

const Embed = Quill.import('blots/embed');

// Custom MentionBlot for handling mentions
class MentionBlot extends Embed {
  static create(value) {
    const node = super.create();
    node.setAttribute('data-id', value.id);
    node.innerHTML = `${value.value}`;
    node.classList.add('mention-default'); // Add default formatting class
    node.style.backgroundColor = 'green'; // Set background color to green
    node.style.color = 'white'; // Set text color to white
    return node;
  }

  static formats(node) {
    return node.classList.contains('mention-default') ? 'mention-default' : null;
  }

  static value(node) {
    return {
      id: node.getAttribute('data-id'),
      value: node.innerText.slice(1)
    };
  }
}

MentionBlot.blotName = 'mention';
MentionBlot.tagName = 'span';
MentionBlot.className = 'mention';

export default MentionBlot;