const getUser = require('./getUser');
const https = require('https');
const fs = require('fs');

function submitUser(id) {
  https.get(`https://geipimine.usp-3.fr/push/${id}`, (res) => {
    let data = '';
    res.on('data', (d) => data += d);
    res.on('end', () => {
      console.log('New candidate', id, data);
    });
  });
}

(async () => {
  const savedUsers = await new Promise((cb) => {
    https.get('https://geipimine.usp-3.fr/fetch', (res) => {
      let data = '';
      res.on('data', (d) => data += d);
      res.on('end', () => {
        cb(JSON.parse(data));
      });
    });
  });

  console.log('Starting miner...');
  function get(i = 0, retry = false) {
    if (!retry) setTimeout(() => get(i + 1), 100);
    else console.log('Retry getting', i);

    if (savedUsers.find((u) => u.id === i)) {
      console.log('User', i, 'is already registered');
      return false;
    }

    getUser(i, !(i % 2)).then((rs) => {
      if (rs.id) submitUser(i);
      else if (rs.error) get(i, true);
      else console.log(i, rs);
      fs.writeFileSync('./lastID.txt', `${i}`);
    });
  }
  get(parseInt(fs.readFileSync('./lastID.txt')));
})();
