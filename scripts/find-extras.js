const fs = require('fs');
const path = require('path');

const assigned = new Set([
  'Phantom X 7.jpg','phantom x face.jpg','Phatnom grip.jpg',
  'Newport face.jpg','newport back.jpg',
  'GoLo Face.jpg','GoLo back.jpg','GoLo grip.jpg','GoLo 1.5.jpg',
  'calfornia.jpg','california ,...jpg','California face.jpg','California Grip.jpg',
  'Select Face.JPG','Select top.JPG','Select grip.JPG','select flashback.jpg',
  'Spider face.jpg','Spider top.jpg','SPider grip.jpg','spider faceee.jpg',
  'Oddesey Ai .jpg','Oddessey ai.jpg','Oddeseey Ai top.jpg',
  "newMuiraTC201's face.JPG","newMuiraTC201's full.jpg","newMuiraTC201's top.JPG","newMuiraTC201's good angle.jpg",
  'Muira CB57 Irons.jpg','Muira CB 57 FACE.jpg','Muira cb 57 face 2.jpg','Muira cb57 grips.jpg','Muira cb 57 shaft.jpg',
  'Miuita tourney COVER PHOTO.jpg','miura tourney.jpg','Muira 56 degree (TOURNEY).jpg','dd Muira tourney.jpg',
  'Mizuno face.jpg','Mizuno Cover 4-pw.jpg','Mizuno Grips.jpg','Mixuno MP-20 Sun.jpg',
  'Pingi59.jpg','Pingi59 2.jpg','Pingi59 grips.jpg','Ping i59 Sun.jpg',
  'Driving Iron - MB7 3 & 4 iron.jpg','M7 face.jpg','M7 Grips.jpg','M7.jpg',
  'Rogue 3&4 hybrid face.jpg','Rogue 3&4 hybrid full.jpg','Rogue 3&4 hybrid top.jpg','Rogue 3&4 hybrid jumbo grip.jpg',
  'Ping425 face.jpg','Ping425 back.jpg','Ping425 gripshaft.jpg',
  'Qi10 5 wood.jpg','qi10 5wood face.jpg',
  'Sim Max 5 wood face.jpg','Sim Max 5 wood  full.jpg','Sim Max 5 wood topandface.jpg','Sim Max 5 wood shaft.jpg',
  'Titlist 918 D2 Driver 10.5 degree full.jpg','Titlist 918 D2 Driver 10.5 degree topandface.jpg','Titlist 918 D2 Driver 10.5 degree  top.jpg','Titlist 918 D2 Driver 10.5 degree  shaft.jpg'
]);

const root = path.resolve(__dirname, '..');
const files = fs.readdirSync(root).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
const extra = files.filter(f => !assigned.has(f));
console.log('TOTAL image files in repo:', files.length);
console.log('Already assigned:', files.length - extra.length);
console.log('EXTRA (unassigned):', extra.length);
extra.forEach(f => console.log(' ', f));
