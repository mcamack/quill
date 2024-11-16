// MentionBlot.js
import { Quill } from 'react-quill-new';

const Embed = Quill.import('blots/embed');

let activeDropdown = null; // Track the active dropdown

// Custom MentionBlot for handling mentions
class MentionBlot extends Embed {
  static create(value) {
    console.log("VALUE: " + value)
    const node = super.create();
    node.setAttribute('data-id', value.id);
    node.innerHTML = `${value.value}`;
    node.classList.add('mention-default'); // Add default formatting class
    
    // Set styling based on mention character
    if (value.type == "user") {
      console.log("user")
      node.setAttribute('type', "user");
      node.style.backgroundColor = 'green';
      node.style.color = 'white';
    } else if (value.type == "artifact") {
      node.setAttribute('type', "artifact");
      console.log("atifact")
      node.style.backgroundColor = 'blue';
      node.style.color = 'white';
    }

    // node.style.backgroundColor = 'green'; // Set background color to green
    // node.style.color = 'white'; // Set text color to white

    node.addEventListener('mouseover', (e) => {
      e.stopPropagation();
      node.style.cursor = 'pointer';
      node.style.opacity = '0.8';
    }); // Add hover event handler

    node.addEventListener('mouseout', (e) => {
      e.stopPropagation();
      node.style.opacity = '1';
    }); // Revert changes on mouse out

    node.addEventListener('click', (e) => {
      e.stopPropagation();
      // Remove existing dropdown if present
      if (activeDropdown && document.body.contains(activeDropdown)) {
        document.body.removeChild(activeDropdown);
        activeDropdown = null;
      }

      // Create dropdown element
      const dropdown = document.createElement('div');
      dropdown.classList.add('mention-dropdown');
      dropdown.style.position = 'fixed';
      dropdown.style.backgroundColor = 'white';
      dropdown.style.border = '1px solid #ccc';
      dropdown.style.padding = '5px';
      dropdown.style.zIndex = '1300'; // Ensure dropdown appears above MUI Drawer

      // Populate dropdown with options
      const options = ['Option 1', 'Option 2', 'Option 3'];
      options.forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('mention-option');
        optionElement.innerText = option;
        optionElement.style.padding = '5px';
        optionElement.style.cursor = 'pointer';

        // Add hover effect to highlight the option
        optionElement.addEventListener('mouseover', () => {
          optionElement.style.backgroundColor = '#f0f0f0';
        });
        optionElement.addEventListener('mouseout', () => {
          optionElement.style.backgroundColor = 'white';
        });

        // Add click event handler specific to each option
        optionElement.addEventListener('click', (e) => {
          e.stopPropagation();
          switch (option) {
            case 'Option 1':
              alert(`Option 1 for ${value.value}`);
              break;
            case 'Option 2':
              alert(`Option 2 for ${value.value}`);
              break;
            case 'Option 3':
              alert(`Option 3 for ${value.value}`);
              break;
            default:
              alert(`Selected: ${option}`);
          }
          if (document.body.contains(dropdown)) {
            document.body.removeChild(dropdown);
          }
          activeDropdown = null;
        });
        dropdown.appendChild(optionElement);
      });

      // Append dropdown to body and position it
      document.body.appendChild(dropdown);
      const rect = node.getBoundingClientRect();
      dropdown.style.top = `${rect.bottom + window.scrollY}px`;
      dropdown.style.left = `${rect.left + window.scrollX}px`;
      activeDropdown = dropdown;

      // Close dropdown when clicking outside
      const closeDropdown = (e) => {
        if (!dropdown.contains(e.target)) {
          if (document.body.contains(dropdown)) {
            document.body.removeChild(dropdown);
          }
          document.removeEventListener('click', closeDropdown);
          activeDropdown = null;
        }
      };
      setTimeout(() => document.addEventListener('click', closeDropdown), 0);
    }); // Add click event handler
    return node;
  }

  static formats(node) {
    return node.classList.contains('mention-default') ? 'mention-default' : null;
  }

  static value(node) {
    return {
      id: node.getAttribute('data-id'),
      type: node.getAttribute('type'),
      value: node.innerText.slice(1)
    };
  }
}

MentionBlot.blotName = 'mention';
MentionBlot.tagName = 'span';
MentionBlot.className = 'mention';

export default MentionBlot;
