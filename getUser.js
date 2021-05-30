const https = require('https');
const childProcess = require('child_process');

function proxyRequest(id) {
  return new Promise((cb) => {
    childProcess.spawn('bash', ['request.sh', id]).stdout.on('data', (body) => {
      cb(body.toString());
    });
  });
}

function request(id, proxy = false) {
  if (proxy) return proxyRequest(id);
  return new Promise((cb) => {
    const req = https.request({
      method: 'POST',
      hostname: 'www.geipi-polytech.org',
      path: '/integration_notes/consultation_notes.php',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    }, (res) => {
      let data = [];
      res.on('data', (c) => data += c);
      res.on('end', () => cb(data));
    });

    req.end(`numero_inscription=${id}&valider=Valider`);
  });
}

module.exports = (id = 0, proxy = false) => {
  return new Promise(async (cb) => {
    const data = await request(id, proxy);
    if (data.includes('Prénom')) {
      const marks = data.match(/<td>.*?<\/td>/g)
        .join('\n')
        .replace(/<.*?>/g, '')
        .split('\n');

      const coordMatch = data.match(/"coordonnees_eleve(.|\n)*?<p>/g);
      const coord = ((coordMatch && coordMatch[0])
        ? coordMatch[0]
          .replace(/(<.*?>)|(".*?">)/g, '')
          .replace(/\t|\n/g, ' ')
          .replace(/ {2,}/g, ' ')
          .replace(/^ | $/g, '')
        : null) || null;

      const centerMatch = data.match(/"adresse_centre">(.|\n)*?<\/p>/g);
      const center = ((centerMatch && centerMatch[0])
        ? centerMatch[0]
          .replace(/(<.*?>)|(".*?">)/g, '')
          .replace(/\t|\n/g, ' ')
          .replace(/ {2,}/g, ' ')
          .replace(/^ | $/g, '')
        : null) || null;

      const roomMatch = data.match(/"salle">(.|\n)*?</g);
      const room = ((roomMatch && roomMatch[0])
        ? roomMatch[0]
          .replace(/(<.*?>)|(".*?">)|</g, '')
          .replace(/\t|\n/g, ' ')
          .replace(/ {2,}/g, ' ')
          .replace(/^ | $/g, '')
        : null) || null;

      const specMatch = data.match(/<strong>\n.*?<\/strong>/g);
      const spec = ((specMatch && specMatch[0])
        ? specMatch[0]
          .replace(/(<.*?>)|(".*?">)|,/g, '')
          .replace(/\t|\n/g, ' ')
          .replace(/ {2,}/g, ' ')
          .replace(/^ | $/g, '')
        : null) || null;

      const dateMatch = data.match(/>.*?de .{5} à .{5}</g);
      const date = ((dateMatch && dateMatch[0])
        ? dateMatch[0]
          .replace(/<|>/g, '')
          .replace(/ {2,}/g, ' ')
          .replace(/^ | $/g, '')
        : null) || null;

      cb({
        id,
        prenom: marks[0],
        nom: marks[1],
        oralMark: parseFloat(marks[2]),
        mathsMark: parseFloat(marks[3]) / 80 * 20,
        specMark: parseFloat(marks[4]) / 40 * 20,
        spec,
        date,
        coord,
        center,
        room,
      });
    } else cb({});
  });
};
