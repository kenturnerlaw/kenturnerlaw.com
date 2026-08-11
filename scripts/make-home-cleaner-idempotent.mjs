import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'scripts/clean-home-template.mjs');
let s = fs.readFileSync(file, 'utf8');
const oldTail = `const start = html.indexOf(START_ANCHOR);\nconst end = html.indexOf(END_ANCHOR);\nif (start < 0 || end < 0 || end < start) throw new Error('Homepage legacy CSS stack boundary not found');\nconst after = end + END_ANCHOR.length;\nhtml = html.slice(0, start) + template + html.slice(after);\nfs.writeFileSync(file, html);\nconsole.log('Consolidated homepage CSS into one template block');`;
const newTail = `const HOME_START = '/* KT-HOME-TEMPLATE-START */';\nconst HOME_END = '/* KT-HOME-TEMPLATE-END */';\nconst existingStart = html.indexOf(HOME_START);\nconst existingEnd = html.indexOf(HOME_END);\nif (existingStart >= 0 && existingEnd > existingStart) {\n  const after = existingEnd + HOME_END.length;\n  html = html.slice(0, existingStart) + template + html.slice(after);\n} else {\n  const start = html.indexOf(START_ANCHOR);\n  const end = html.indexOf(END_ANCHOR);\n  if (start < 0 || end < 0 || end < start) throw new Error('Homepage CSS template boundary not found');\n  const after = end + END_ANCHOR.length;\n  html = html.slice(0, start) + template + html.slice(after);\n}\nfs.writeFileSync(file, html);\nconsole.log('Consolidated homepage CSS into one template block');`;
if (s.includes(newTail)) {
  console.log('Homepage cleaner already idempotent');
} else {
  if (!s.includes(oldTail)) throw new Error('Cleaner tail not found');
  s = s.replace(oldTail, newTail);
  fs.writeFileSync(file, s);
  console.log('Made homepage cleaner idempotent');
}
