const fs = require('fs');

const APOS_ENTITY = '\x26apos\x3b'; // '

// Specific replacements for lines that have = signs (label elements, p elements with inline styles)
const specificFixes = {
  'src/components/SetupWizard.tsx': [
    ['Personalit\u00e0 dell\x27AI', 'Personalit\u00e0 dell' + APOS_ENTITY + 'AI'],
    ['Canali gestiti dall\x27AI', 'Canali gestiti dall' + APOS_ENTITY + 'AI'],
  ],
  'src/components/views/AiAssistantView.tsx': [
    ['Nessuna prenotazione gestita dall\x27AI ancora.', 'Nessuna prenotazione gestita dall' + APOS_ENTITY + 'AI ancora.'],
  ],
  'src/components/views/SettingsView.tsx': [],
};

for (const [f, fixes] of Object.entries(specificFixes)) {
  let c = fs.readFileSync(f, 'utf8');
  let changed = false;
  for (const [from, to] of fixes) {
    if (c.includes(from)) {
      c = c.split(from).join(to);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(f, c);
    console.log('Fixed:', f);
  } else {
    console.log('No change:', f);
  }
}
