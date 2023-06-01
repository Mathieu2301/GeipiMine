<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: content-type');
header('Content-Type: application/json; charset=utf-8');

require_once('./mysql.php');

function rs($rs) {
  exit(json_encode($rs));
}

$args = explode('/', $_SERVER['REQUEST_URI']);

function getUser($id) {
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, 'https://www.geipi-polytech.org/integration_notes/consultation_notes.php');
  curl_setopt($ch, CURLOPT_POST, 1);
  curl_setopt($ch, CURLOPT_POSTFIELDS, "numero_inscription=$id&valider=Valider");
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  $html = curl_exec($ch);
  curl_close ($ch);

  preg_match_all("#<td>(.+)?</td>#iU", $html, $marks);
  preg_match_all("#<strong>\n\t*?(.*),?\t*?<\/strong>#iU", $html, $spec);
  preg_match_all("#>(.*?de .{5} à .{5})<#iU", $html, $date);
  preg_match_all("#\"coordonnees_eleve\">((\n|.)*)<p>#iU", $html, $coord);
  $coord = str_replace("\t", '', $coord[1][0]);
  $coord = str_replace("\n", '', $coord);
  $coord = str_replace('<br>', ', ', $coord);
  $coord = str_replace(', , ', '', $coord);

  preg_match_all("#\"adresse_centre\">((\n|.)*)</p>#iU", $html, $center);
  $center = str_replace("\t", '', $center[1][0]);
  $center = str_replace("\n", '', $center);
  $center = str_replace('<br>', ', ', $center);

  preg_match_all("#\"salle\">\n\t*?(.*),?\t*?<#iU", $html, $room);

  return [
    $id,
    $marks[1][0],
    $marks[1][1],
    ($marks[1][2] !== '') ? floatval($marks[1][2]) : null,
    ($marks[1][3] !== '') ? floatval($marks[1][3]) / 80 * 20 : null,
    ($marks[1][4] !== '') ? floatval($marks[1][4]) / 40 * 20 : null,
    $spec[1][0],
    $date[1][0],
    $coord ? $coord : null,
    $center ? $center : null,
    $room[1][0] ? $room[1][0] : null,
  ];
}

if ($args[1] === 'fetch') {
  $rq = $pdo->prepare('SELECT * FROM geipidata');
  $rq->execute();
  rs($rq->fetchAll(PDO::FETCH_ASSOC));
}

if ($args[1] === 'push' && intval($args[2])) {
  $user = getUser(intval($args[2]));

  if (!$user[1]) rs([ error => true, type => 'NOT_REGISTRED' ]);

  $rqCheck = $pdo->prepare('SELECT id FROM geipidata WHERE id = ?');
  $rqCheck->execute([ $user[0] ]);
  $rsCheck = $rqCheck->fetch()['id'];

  if (!$rsCheck) {
    $insert = true;
    $rqPush = $pdo->prepare('INSERT INTO geipidata (id, prenom, nom, oralMark, mathsMark, specMark, spec, date, coord, center, room) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  } else {
    $update = true;
    $rqPush = $pdo->prepare('UPDATE geipidata SET prenom = ?, nom = ?, oralMark = ?, mathsMark = ?, specMark = ?, spec = ?, date = ?, coord = ?, center = ?, room = ? WHERE id = ?');
    $user[] = $user[0];
    array_shift($user);
  }

  $rqPush->execute($user);
  rs([ success => true, insert => !!$insert, update => !!$update ]);
}
?>