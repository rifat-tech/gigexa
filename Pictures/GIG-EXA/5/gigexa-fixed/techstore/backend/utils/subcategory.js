// Infers a product "subcategory" (type) from its name + tags. Keeping this in
// one place means the filter facets always match real inventory instead of a
// hard-coded list that can drift from the catalog.

// Order matters: more specific terms first.
const RULES = [
  ['Laptop', ['laptop', 'notebook', 'zenbook', 'vivobook', 'ideapad', 'thinkpad', 'yoga', 'macbook', 'copilot', 'expertbook', 'legion 5', 'loq', 'rog laptop']],
  ['Mount / Bracket', ['mount', 'bracket', 'wall kit', 'pole mount', 'clamp', 'vesa', 'stand kit']],
  ['Gaming Monitor', ['gaming monitor', '240hz', '165hz', '144hz', 'ultragear', 'legion 24']],
  ['Monitor', ['monitor', 'display panel', 'curved monitor', '4k monitor']],
  ['Android TV', ['android tv', 'google tv', 'qled', 'led tv', 'smart tv']],
  ['Graphics Card', ['graphics card', 'gpu', 'radeon', 'geforce', 'rtx', 'rx 9060', 'rx 7', 'gddr6']],
  ['CPU Cooler', ['cpu cooler', 'liquid cooler', 'masterliquid', 'aio', 'air cooler']],
  ['Processor', ['processor', 'ryzen ', 'core i9', 'core i7 ', 'core ultra', ' cpu ']],
  ['SSD / Storage', ['ssd', 'nvme', 'portable ssd', 'hard drive', 'hdd', 'ironwolf', 'nas', 'diskstation']],
  ['RAM', ['ram', 'ddr4', 'ddr5', 'memory module']],
  ['Keyboard', ['keyboard', 'keeb']],
  ['Mouse', ['mouse', 'gaming mouse']],
  ['Controller', ['controller', 'gamepad']],
  ['Headphone / Audio', ['headphone', 'headset', 'earbuds', 'earphone', 'airpods']],
  ['Speaker', ['speaker', 'soundbar', 'home theater']],
  ['Projector', ['projector']],
  ['Gimbal / Camera', ['gimbal', 'stabilizer', 'action camera', 'webcam']],
  ['Access Point', ['access point', 'accesspoint', 'wifi ap', 'wireless ap', 'cap ac']],
  ['Firewall', ['firewall', 'firebox', 'fortigate', 'watchguard', 'checkpoint']],
  ['Router', ['router', 'routerboard', 'hex', 'ccr', 'rb750', 'gateway', 'starlink']],
  ['Switch', ['switch', 'sg350', 'crs', 'css', 'poe switch']],
  ['Printer', ['printer', 'ink tank', 'laser printer', 'inkjet', 'dcp-', 'label printer']],
  ['Smartwatch', ['smartwatch', 'smart watch', 'watch series', 'galaxy watch']],
  ['Accessories', ['cable', 'sfp', 'adapter', 'power supply', 'psu', 'mount', 'transceiver', 'rj45', 'dock']],
];

function inferSubcategory(product) {
  const hay = [
    product.name || '',
    (Array.isArray(product.tags) ? product.tags.join(' ') : ''),
    product.shortDescription || ''
  ].join(' ').toLowerCase();

  for (const [label, keywords] of RULES) {
    if (keywords.some(k => hay.includes(k))) return label;
  }
  return 'Other';
}

module.exports = { inferSubcategory };
